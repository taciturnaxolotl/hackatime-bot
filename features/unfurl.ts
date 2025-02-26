import type { LinkUnfurls, MessageAttachment } from "slack-edge";
import { slackApp } from "../index";
import type { UserData } from "./unfurl.types";

const unfurl = async () => {
  slackApp.event("link_shared", async ({ context, payload }) => {
    const unfurls: LinkUnfurls = {};

    for (const link of payload.links) {
      const url = new URL(link.url);
      const path = url.pathname;
      if (path.includes("api") || path.includes("swagger")) {
        unfurls[link.url] = {
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*API Documentation*",
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "The api has full swagger docs available at <https://waka.hackclub.com/swagger-ui/swagger-ui/index.html|`/swagger-ui`> if you have any questions about the api or need an admin token dm <@U062UG485EE>",
                },
              ],
            },
            {
              type: "divider",
            },
            {
              type: "image",
              image_url:
                "https://hc-cdn.hel1.your-objectstorage.com/s/v3/c8e02c0a89535d80ce8e0a64ef36f0ead31ad26a_image.png",
              alt_text: "Hackatime Swagger Docs OG Image",
            },
          ],
        };
      } else {
        const unfurl = await codingTime(url, payload.user);
        if (unfurl) unfurls[link.url] = unfurl;
      }
    }

    await context.client.chat.unfurl({
      channel: payload.channel,
      ts: payload.message_ts,
      unfurls,
    });
  });
};

async function codingTime(
  link: URL,
  user: string,
): Promise<MessageAttachment | null> {
  const interval = link.searchParams.get("interval") || "last_7_days";

  const userData = await fetchUserData(user, interval);
  if (!userData) return null;
  const totalSeconds = userData.projects.reduce(
    (acc: number, curr: { total: number }) => acc + curr.total,
    0,
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pageTitle = await (async () => {
    const response = await fetch(link);
    const html = await response.text();
    const match = html.match(/<title>(.*?)<\/title>/);
    return match ? match[1] : "Coding Activity";
  })();

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${pageTitle}*\n\nThe best place to track your coding activity :orpheus-leaf-grow:`,
        },
      },
      {
        type: "image",
        image_url: "https://waka.hackclub.com/assets/images/og.jpg",
        alt_text: "Hackatime OG Image",
      },
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `<@${user}> has spent ${hours} hours, ${minutes} minutes, and ${seconds} seconds coding in the ${interval.replaceAll("_", " ")}${interval.includes("days") || interval.includes("month") ? "" : " interval"}.${link.toString().includes("settings#danger_zone") ? "\n\ncareful there bud :eyes: the danger zone is no joke" : ""}${link.toString().includes("projects") ? `\n\nthey have over ${userData.projects.length} projects with the biggest being \`${userData.projects.sort((a: { total: number }, b: { total: number }) => b.total - a.total)[0].key}\` at \`${Math.floor(userData.projects.sort((a: { total: number }, b: { total: number }) => b.total - a.total)[0].total / 3600)} hours\`` : ""}`,
          },
        ],
      },
    ],
  };
}

async function fetchUserData(
  user: string,
  interval?: string,
): Promise<UserData | null> {
  const response = await fetch(
    `https://waka.hackclub.com/api/summary?user=${user}&interval=${interval || "last_7_days"}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
      },
    },
  );

  return response.status === 200 ? ((await response.json()) as UserData) : null;
}

export default unfurl;
