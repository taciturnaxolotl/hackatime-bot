import { slackApp } from "../index";

const resetPassword = async () => {
  slackApp.action("reset-password", async ({ context }) => {
    if (!context?.respond) return;

    const user = (
      await context.client.users.info({ user: context.userId as string })
    ).user;

    if (!user) return;

    const reset: { user_id: string; reset_token: string } = await fetch(
      "https://waka.hackclub.com/reset-password",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
        },
        body: new URLSearchParams({
          email: user.profile?.email || "",
        }),
      },
    ).then((res) => res.json());

    if (reset.user_id !== context.userId)
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
                text: `if this keeps happening dm <@U062UG485EE> and let them know \`${user.profile?.email}\` doesn't exist`,
              },
            ],
          },
        ],
      });

    await context.respond({
      response_type: "ephemeral",
      text: "great! I generated a link to reset your password :yay:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "great! I generated a link to reset your password :yay:",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `reset link: \`https://waka.hackclub.com/set-password?token=${reset.reset_token}\``,
            },
          ],
        },
      ],
    });
  });
};

export default resetPassword;
