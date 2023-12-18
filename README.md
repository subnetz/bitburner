# Bitburner scripts repo

## Installation

Clone the repo, clone the game repo and install packages

```sh
git clone https://github.com/subnet-/bitburner
cd bitburner
git clone https://github.com/bitburner-official/bitburner-src.git .game
npm i
```

Enter your Bitburner API key inside `.vscode/settings.json`

```json
"bitburner.authToken": "YourAPIKeyHere"
```

Run build

```sh
npm run build
#or
npm run dev
```
