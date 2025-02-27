import { slackApp } from "../index";
import { fetchUserData } from "./unfurl";

const summary = async () => {
  slackApp.action("share-summary", async ({ context, payload }) => {
    if (!context?.respond) return;

    // @ts-expect-error
    const interval = payload.actions[0].value;
    const userData = await fetchUserData(context.userId, interval);
    if (!userData) {
      return;
    }

    const projectTotal = userData.projects.reduce((total, project) => {
      return total + project.total;
    }, 0);
    userData.projects.sort((a, b) => b.total - a.total);

    await context.respond({
      text: "sent to channel :3c:",
      blocks: [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "sent to channel :3c:",
            },
          ],
        },
      ],
    });

    await context.client.chat.postMessage({
      channel: context.channelId as string,
      text: `here's a new hackatime summary for <@${context.userId}>!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `here's a new hackatime summary for <@${context.userId}>! :roo-yay:`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `they have spent ${Math.floor(projectTotal / 3600)} hours, ${Math.floor((projectTotal % 3600) / 60)} minutes, and ${projectTotal % 60} seconds coding in the ${interval.replaceAll("_", " ")}${interval.includes("days") || interval.includes("month") ? "" : " interval"}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `their most active project was \`${userData.projects[0].key}\`, where you spent ${Math.floor(userData.projects[0].total / 3600)} hours, ${Math.floor((userData.projects[0].total % 3600) / 60)} minutes, and ${userData.projects[0].total % 60} seconds`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `here's a list of the rest of their projects:\n\n${userData.projects
                .slice(1)
                .map(
                  (project) =>
                    `\`${project.key}\`: ${Math.floor(project.total / 3600)} hours, ${Math.floor((project.total % 3600) / 60)} minutes, and ${project.total % 60} seconds`,
                )
                .join("\n")}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "get your own summary by running `/hackatime summary`!",
            },
          ],
        },
      ],
    });
  });
};

export default summary;
