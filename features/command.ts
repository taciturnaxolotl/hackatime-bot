import { slackApp } from "../index";
import { fetchUserData } from "./unfurl";

const command = async () => {
  slackApp.command("/hackatime", async ({ context, payload }) => {
    if (!context?.respond) return;
    const hackatimeUser: { apiKey: string } | null = await fetch(
      `https://waka.hackclub.com/api/special/apikey?user=${context.userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
        },
      },
    ).then((res) => (res.status === 200 ? res.json() : null));
    console.log(payload.text);
    if (hackatimeUser) {
      if (payload.text.includes("summary")) {
        const interval = payload.text.split(" ")[1] || "month";
        const userData = await fetchUserData(context.userId, interval);
        if (!userData) {
          await context.respond({
            response_type: "ephemeral",
            text: "uh oh! something went wrong :ohnoes:",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "uh oh! something went wrong :ohnoes:",
                },
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: "if this keeps happening dm <@U062UG485EE> and let them know",
                  },
                ],
              },
            ],
          });
          return;
        }

        const projectTotal = userData.projects.reduce((total, project) => {
          return total + project.total;
        }, 0);
        userData.projects.sort((a, b) => b.total - a.total);

        await context.respond({
          response_type: "ephemeral",
          text: "here's your summary! :yay:",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `here's your summary <@${context.userId}>! :roo-yay:`,
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
                  text: `you have spent ${Math.floor(projectTotal / 3600)} hours, ${Math.floor((projectTotal % 3600) / 60)} minutes, and ${projectTotal % 60} seconds coding in the ${interval.replaceAll("_", " ")}${interval.includes("days") || interval.includes("month") ? "" : " interval"}`,
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
                  text: `your most active project was \`${userData.projects[0].key}\`, where you spent ${Math.floor(userData.projects[0].total / 3600)} hours, ${Math.floor((userData.projects[0].total % 3600) / 60)} minutes, and ${userData.projects[0].total % 60} seconds`,
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
                  text: `here's a list of the rest of your projects:\n\n${userData.projects
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
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "share with channel",
                  },
                  value: interval,
                  action_id: "share-summary",
                },
              ],
            },
          ],
        });
        return;
      }

      await context.respond({
        response_type: "ephemeral",
        text: "Hi there! I'm the Hackatime bot :hyper-dino-wave:",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Hi there! I'm the Hackatime bot :hyper-dino-wave:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `It looks like you already have an account! You can log in to the <https://waka.hackclub.com/login|Hackatime dashboard> with your username \`${context.userId}\` and password :3c:`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Reset Password",
                },
                action_id: "reset-password",
                style: "danger",
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "gutentag!",
                },
                action_id: "bye",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `your api key for the Hackatime API is \`${hackatimeUser.apiKey}\``,
              },
            ],
          },
        ],
      });
      return;
    }

    context.respond({
      response_type: "ephemeral",
      text: "Hi there! I'm the Hackatime bot :hyper-dino-wave:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hi there! I'm the Hackatime bot :hyper-dino-wave:",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "I can see that you don't have an account yet. Do you want me to make you one?",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Yes, please!",
              },
              value: "yes",
              style: "primary",
              action_id: "create-account",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "No, thanks",
              },
              value: "no",
              action_id: "no-thanks",
            },
          ],
        },
      ],
    });
  });

  slackApp.action("no-thanks", async ({ context }) => {
    if (context?.respond)
      await context.respond({
        response_type: "ephemeral",
        text: "No worries! If you change your mind just type `/hackatime` again ^-^",
      });
  });

  slackApp.action("bye", async ({ context }) => {
    if (context?.respond)
      await context.respond({
        response_type: "ephemeral",
        text: "bye!!! :goodnight:",
      });
  });
};

export default command;
