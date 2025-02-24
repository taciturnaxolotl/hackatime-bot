import { slackApp } from "../index";

const signup = async () => {
  slackApp.action("create-account", async ({ context }) => {
    if (context?.respond)
      await context.respond({
        response_type: "ephemeral",
        text: "sweet! i'll need a password from you then!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "sweet! i'll need a password from you then!",
            },
          },
          {
            type: "input",
            dispatch_action: true,
            block_id: "password",
            element: {
              type: "plain_text_input",
              action_id: "set-password",
              focus_on_load: true,
              min_length: 6,
              placeholder: {
                type: "plain_text",
                text: "hackatime4ever!",
              },
            },
            label: {
              type: "plain_text",
              text: "Password:",
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "`Password must be at least 6 characters long.`",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "perfect, next!",
                },
                value: "next",
                style: "primary",
                action_id: "set-password",
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "i changed my mind",
                },
                value: "no",
                action_id: "no-thanks",
              },
            ],
          },
        ],
      });
  });
};

export default signup;
