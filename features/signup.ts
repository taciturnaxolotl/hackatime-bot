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
              action_id: "set_password",
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
                action_id: "set_password",
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

  slackApp.action("set_password", async ({ context, payload }) => {
    if (!context?.respond) return;

    // @ts-expect-error
    const password: null | string =
      payload?.state.values.password.set_password.value;
    const user = (
      await context.client.users.info({ user: context.userId as string })
    ).user?.profile || { email: "unknown" };

    if (
      payload?.type !== "block_actions" ||
      (payload?.actions[0].block_id === "password" && !password)
    ) {
      await context.respond({
        response_type: "ephemeral",
        text: "boooooo. `null` passwords are not allowed :(\n\nmake it at least 6 characters and try again!",
      });
      return;
    }

    await context.respond({
      response_type: "ephemeral",
      text: "does this look good to you? :eyes:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "does this look good to you? :eyes:",
          },
        },
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*hackatime profile*\n\norpheus mail: \`${user.email}\`\npassphrase: \`${password}\`\nusername: \`${context.userId}\``,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "yes, looks good!",
              },
              value: password as string,
              style: "primary",
              action_id: "make-account",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "no, let me change it",
              },
              value: "no",
              action_id: "bad-info",
            },
          ],
        },
      ],
    });
  });

  slackApp.action("make-account", async ({ context, payload }) => {
    if (!context?.respond) return;
    if (!context.client.users) return;

    const user = (
      await context.client.users.info({ user: context.userId as string })
    ).user;

    if (!user) return;

    const name =
      user.real_name || user.profile?.display_name || "Anonymous Hacker";

    // @ts-expect-error
    const password = payload?.actions[0].value;

    const signup: { created: boolean; api_key: string } = await fetch(
      "https://waka.hackclub.com/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
        },
        body: new URLSearchParams({
          location: user.tz as string,
          username: context.userId as string,
          name,
          email: user.profile?.email || "",
          password: password || "",
          password_repeat: password || "",
        }).toString(),
      },
    ).then((res) => res.json());

    await context.respond({
      response_type: "ephemeral",
      text: "great! your account has been created :yay:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "great! your account has been created :yay:",
          },
        },
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `you can now log in to the <https://waka.hackclub.com/login|Hackatime dashboard> with your username \`${context.userId}\` and password \`${password}\` :3c:`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `your api key for the Hackatime API is \`${signup.api_key}\``,
            },
          ],
        },
      ],
    });
  });

  slackApp.action("bad-info", async ({ context }) => {
    if (context?.respond)
      await context.respond({
        response_type: "ephemeral",
        text: "no worries! we can't really change the `username` or `email` but you can change your `password` if you'd like! just re-run this command :3c:",
      });
  });
};

export default signup;
