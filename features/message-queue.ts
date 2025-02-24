import { Database } from "bun:sqlite";
import type { Block, SlackAPIClient } from "slack-edge";

export interface SlackMessage {
  userId?: string;
  channelId?: string;
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

  constructor(slackClient: SlackAPIClient, dbPath = "slack-queue.db") {
    this.slack = slackClient;
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        channelId TEXT,
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
          INSERT INTO messages (userId, channelId, blocks, text, timestamp, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

    stmt.run(
      message.userId ?? null,
      message.channelId ?? null,
      JSON.stringify(message.blocks) ?? null,
      message.text,
      Date.now(),
      "pending",
    );

    if (!this.isProcessing) {
      this.processQueue();
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

        console.log(messages);
        if (messages.length === 0) break;

        await Promise.all(
          messages.map(async (message) => {
            try {
              if (message.channelId) {
                await this.slack.chat.postMessage({
                  channel: message.channelId,
                  blocks:
                    JSON.parse(message.blocks as unknown as string) ??
                    undefined,
                  text: message.text,
                });

                console.log(res);
              } else if (message.userId) {
                await this.slack.chat.postMessage({
                  channel: message.userId,
                  blocks:
                    JSON.parse(message.blocks as unknown as string) ??
                    undefined,
                  text: message.text,
                });
              }

              console.log("Message sent successfully");

              this.db
                .prepare(
                  `
                UPDATE messages
                SET status = 'sent'
                WHERE id = ?
              `,
                )
                .run(message.id);
            } catch (error) {
              console.error("Error sending message", error);
              this.db
                .prepare(
                  `
                UPDATE messages
                SET status = 'failed'
                WHERE id = ?
              `,
                )
                .run(message.id);
            }
          }),
        );
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
