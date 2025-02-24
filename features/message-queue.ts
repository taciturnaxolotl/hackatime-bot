import { Database } from "bun:sqlite";
import type { Block, SlackAPIClient } from "slack-edge";

export interface SlackMessage {
  channel: string;
  blocks?: Block[];
  text: string;
  timestamp?: number;
  status: "pending" | "sent" | "failed";
}

export default class SlackMessageQueue {
  private db: Database;
  private slack: SlackAPIClient;
  private isProcessing = false;
  private batchSize = 50;
  private rateLimitDelay = 1000; // 1 message per second per channel
  private channelLastMessageTime: Map<string, number> = new Map();
  private totalMessageCount = 0;
  private messageCountResetTime = 0;
  private backoffDelay = 1000;
  private maxBackoff = 30000; // 30 seconds

  constructor(slackClient: SlackAPIClient, dbPath = "slack-queue.db") {
    this.slack = slackClient;
    this.db = new Database(dbPath);
    this.initDatabase();
    this.processQueue();
  }

  private initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel TEXT NOT NULL,
        blocks TEXT,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL
      )
    `);
    this.db.run("CREATE INDEX IF NOT EXISTS idx_status ON messages(status)");
  }

  async enqueue(message: SlackMessage): Promise<void> {
    const stmt = this.db.prepare(`
          INSERT INTO messages (channel, blocks, text, timestamp, status)
          VALUES (?, ?, ?, ?, ?)
        `);

    stmt.run(
      message.channel ?? null,
      JSON.stringify(message.blocks) ?? null,
      message.text,
      Date.now(),
      "pending",
    );

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendWithRateLimit(
    message: SlackMessage & { id: number },
  ): Promise<void> {
    const now = Date.now();

    // Check per-minute total limit
    if (now - this.messageCountResetTime >= 60000) {
      this.totalMessageCount = 0;
      this.messageCountResetTime = now;
    }

    if (this.totalMessageCount >= 350) {
      const waitTime = 60000 - (now - this.messageCountResetTime);
      await this.sleep(waitTime);
      this.totalMessageCount = 0;
      this.messageCountResetTime = Date.now();
    }

    // Check per-channel rate limit
    const channelLastTime =
      this.channelLastMessageTime.get(message.channel) || 0;
    const timeSinceLastChannelMessage = now - channelLastTime;

    if (timeSinceLastChannelMessage < this.rateLimitDelay) {
      await this.sleep(this.rateLimitDelay - timeSinceLastChannelMessage);
    }

    let currentBackoff = this.backoffDelay;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        await this.slack.chat.postMessage({
          channel: message.channel,
          blocks: JSON.parse(message.blocks as unknown as string) ?? undefined,
          text: message.text,
        });

        this.channelLastMessageTime.set(message.channel, Date.now());
        this.totalMessageCount++;

        this.db
          .prepare(
            `
            UPDATE messages
            SET status = 'sent'
            WHERE id = ?
          `,
          )
          .run(message.id);

        return;
      } catch (error) {
        console.error(
          `Error sending message (attempt ${attempts + 1}/${maxAttempts})`,
          error,
        );
        attempts++;

        if (attempts === maxAttempts) {
          this.db
            .prepare(
              `
              UPDATE messages
              SET status = 'failed'
              WHERE id = ?
            `,
            )
            .run(message.id);
          return;
        }

        await this.sleep(currentBackoff);
        currentBackoff = Math.min(currentBackoff * 2, this.maxBackoff);
      }
    }
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log("Processing queue");

    try {
      while (true) {
        const messages = this.db
          .prepare(
            `
            SELECT * FROM messages
            WHERE status = 'pending'
            LIMIT ?
          `,
          )
          .all(this.batchSize) as (SlackMessage & { id: number })[];

        if (messages.length === 0) break;

        // Process messages sequentially to maintain rate limiting
        for (const message of messages) {
          await this.sendWithRateLimit(message);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async cleanup(olderThan: number = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThan;
    this.db
      .prepare(
        `
        DELETE FROM messages
        WHERE timestamp < ? AND status != 'pending'
      `,
      )
      .run(cutoff);
  }

  async queueLength() {
    const result = this.db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM messages
        WHERE status = 'pending'
      `,
      )
      .get();
    return (result as { count: number }).count;
  }
}
