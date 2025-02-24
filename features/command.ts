import { slackApp } from "../index";

const command = async () => {
  slackApp.command("/hackatime", async ({ context, payload }) => {
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
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "No, thanks",
              },
              value: "no",
            },
          ],
        },
      ],
    });
  });
};

export default command;
