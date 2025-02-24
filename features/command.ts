import { slackApp } from "../index";

const command = async () => {
  slackApp.command("/hackatime", async ({ context }) => {
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
};

export default command;
