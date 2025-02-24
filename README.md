<h1 align="center">
    <img src="https://raw.githubusercontent.com/taciturnaxolotl/hackatime-bot/master/.github/images/logo-round.svg" width="200" alt="Logo"/><br/>
    <img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/transparent.png" height="45" width="0px"/>
    Hackatime Slack Bot
    <img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/transparent.png" height="30" width="0px"/>
</h1>

<p align="center">
    <i>signup for a hackatime account and get password resets; all on on the hackclub slack!</i>
</p>

<p align="center">
	<img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/line-break-thin.svg" />
</p>

<p align="center">
	<img src="https://raw.githubusercontent.com/taciturnaxolotl/hackatime-bot/master/.github/images/out.gif" />
</p>

<p align="center">
	<img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/line-break-thin.svg" />
</p>

## How do I use it?

Run the `/hackatime` command in the slack and it will prompt you to click a button to create an account if you don't have one, or to reset your password if you do.

<p align="center">
    <img src="/.github/images/create-account-1.webp" width="500" alt="creating an account"/>
    <img src="/.github/images/has_account.webp" width="500" alt="creating an account - success"/>
</p>

### From a developer's perspective

There is a sweet message queue that is used to handle all hackatime slack messages. This is handled and persisted across restarts with `bun:sqlite`. To access the queue you need an admin token which you can ask me for on slack ([@krn](https://hackclub.slack.com/team/U062UG485EE)).

The queue is interacted with via a `POST` request to `/slack/message` with a `channel`, `text`, and (optionally) `blocks` json encoded in the body.

```bash
curl -X POST "https://hackatime-bot.kierank.hackclub.app/slack/message" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer NOTLEEKINGTHATLOL" \
-d '{
  "channel": "U062UG485EE",
  "text": "Hello from hackatime!"
}'
```

or via fetch with blocks

```typescript
await fetch("https://hackatime-bot.kierank.hackclub.app/slack/message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.MESSAGE_QUEUE_TOKEN}`,
  },
  body: JSON.stringify({
    channel: "U062UG485EE",
    text: "Hello from hackatime!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Hello from hackatime!",
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
            text: "This is a message from the hackatime slack bot!",
          },
        ],
      },
    ],
  }),
});
```

## Devving

Create a slack app as per the [manifest.yaml](manifest.yaml) and an env as below  

```bash
SLACK_BOT_TOKEN=xoxb-xxx-xxxx-xxxxxx
SLACK_SIGNING_SECRET=xxxxxx
NODE_ENV=development
ADMINS=U062UG485EE
HACKATIME_API_KEY=xxxxxx
```

```bash
bun install
bun run index.ts
```

then start an ngrok

```bash
ngrok http --domain casual-renewing-reptile.ngrok-free.app 3000
```

## Screenshots

<details>
<summary>A bunch of screenshots of all the models</summary>

#### Initial Signup

Run the `/hackatime` command in slack and it will start the signup process  

![creating an account](/.github/images/create-account-1.webp)  
*First you'll see the initial signup prompt*  

![cancel creating account](/.github/images/no-worries.webp)  
*No pressure - you can always cancel if you change your mind*  

![creating an account - password](/.github/images/create-account-2.webp)  
*Choose a secure password that meets the requirements*  

![creating an account - bad password](/.github/images/create-account-null.webp)  
*Make sure to enter a valid password!*  

![creating an account - confirm](/.github/images/create-account-3.webp)  
*Confirm your password to make sure it's entered correctly*  

![creating an account - success](/.github/images/create-account-4.webp)  
*Success! Your account is now created*  

#### Existing Account

After you've created an account, you can reset your password if needed by again running the `/hackatime` command in slack  

![has account](/.github/images/has_account.webp)  
*The bot will recognize your existing account*  

![resetting a password](/.github/images/reset-password.webp)  
*You can easily reset your password if needed*  

</details>

<p align="center">
	<img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/line-break.svg" />
</p>

<p align="center">
	<i><code>&copy 2025-present <a href="https://github.com/taciturnaxolotl">Kieran Klukas</a></code></i>
</p>

<p align="center">
	<a href="https://github.com/taciturnaxolotl/carriage/blob/master/LICENSE.md"><img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=AGPL 3.0&logoColor=d9e0ee&colorA=363a4f&colorB=b7bdf8"/></a>
</p>
