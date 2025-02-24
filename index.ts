import { SlackApp } from "slack-edge";
import SlackMessageQueue, { type SlackMessage } from "./features/message-queue";

import * as features from "./features/index";

import { version, name } from "./package.json";
const environment = process.env.NODE_ENV;
import quip from "./quip";

console.log(
  `----------------------------------\n${name} server\n----------------------------------\n`,
);
console.log(`🏗️  Starting ${name}...`);
console.log("📦 Loading Slack App...");
console.log("🔑 Loading environment variables...");

if (
  !process.env.SLACK_BOT_TOKEN ||
  !process.env.SLACK_SIGNING_SECRET ||
  !process.env.ADMINS
) {
  throw new Error(
    "Missing required environment variables: SLACK_BOT_TOKEN SLACK_SIGNING_SECRET or ADMINS",
  );
}

const slackApp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    SLACK_LOGGING_LEVEL: "INFO",
  },
  startLazyListenerAfterAck: true,
});
const slackClient = slackApp.client;

const messageQueue = new SlackMessageQueue(slackClient, "data/slack-queue.db");
console.log(`👔 Message Queue Size: ${await messageQueue.queueLength()}`);

console.log(`⚒️  Loading ${Object.entries(features).length} features...`);
for (const [feature, handler] of Object.entries(features)) {
  console.log(`📦 ${feature} loaded`);
  if (typeof handler === "function") {
    handler();
  }
}

export default {
  port: process.env.PORT || 3000,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (path) {
      case "/":
        return new Response(`Hello World from ${name}@${version}`);
      case "/health":
        return new Response("OK");
      case "/slack":
        return slackApp.run(request);
      case "/slack/message": {
        if (
          request.headers.get("Authorization") !==
          `Bearer ${process.env.API_KEY}`
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const message: SlackMessage = await request.json();
        const { channel, text } = message;

        if (!channel || !text) {
          return new Response(
            `Invalid fields: ${[
              !channel && "channel is required",
              !text && "text is required",
            ]
              .filter(Boolean)
              .join(", ")}`,
            { status: 400 },
          );
        }

        await messageQueue.enqueue(message);

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      default:
        return new Response("404 Not Found", { status: 404 });
    }
  },
};

console.log(
  `🚀 Server Started in ${Bun.nanoseconds() / 1000000} milliseconds on version: ${version}!\n\n----------------------------------\n`,
);

console.log(quip());

console.log("\n----------------------------------\n");

export { slackApp, slackClient, version, name, environment };
