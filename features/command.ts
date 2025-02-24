import { slackApp } from "../index";

const command = async () => {
  slackApp.command("/hackatime", async ({ context }) => {
    const hackatimeUser: { apiKey: string } | null = await fetch(
      `https://waka.hackclub.com/api/special/apikey?user=${context.userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
        },
      },
    ).then((res) => (res.status === 404 ? null : res.json()));

    if (hackatimeUser) {
      if (context?.respond)
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
