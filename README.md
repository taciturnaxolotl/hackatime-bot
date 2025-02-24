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

## Devving

Create a slack app as per the [manifest.yaml](manifest.yaml) and an env as below  

```bash
SLACK_BOT_TOKEN=xoxb-xxx-xxxx-xxxxxx
SLACK_SIGNING_SECRET=xxxxxx
NODE_ENV=development
ADMINS=U062UG485EE
```

```bash
bun install
bun run index.ts
```

then start an ngrok

```bash
ngrok http --domain casual-renewing-reptile.ngrok-free.app 3000
```

<p align="center">
	<img src="https://raw.githubusercontent.com/taciturnaxolotl/carriage/master/.github/images/line-break.svg" />
</p>

<p align="center">
	<i><code>&copy 2025-present <a href="https://github.com/taciturnaxolotl">Kieran Klukas</a></code></i>
</p>

<p align="center">
	<a href="https://github.com/taciturnaxolotl/carriage/blob/master/LICENSE.md"><img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=AGPL 3.0&logoColor=d9e0ee&colorA=363a4f&colorB=b7bdf8"/></a>
</p>
