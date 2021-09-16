# Anime-Watch-Parties

This extension allows you to enjoy your favorite anime on Crunchyroll, Funimation or Wakanim with your friends.

## Install

- Firefox: Download the [xpi release](https://github.com/Dragicafit/Anime-Watch-Parties/releases/download/v0.1.0-beta/Wakanim-With-Friends.xpi), go to `about:debugging#/runtime/this-firefox`, click on `Load Temporay Add-on...` and select the xpi file.
- Chromium: Download the [crx release](https://github.com/Dragicafit/Anime-Watch-Parties/releases/download/v0.1.0-beta/Wakanim-With-Friends.crx), go to `chrome://extensions`, enable debugging, drag and drop the crx file.
- Chrome: Download the [crx release](https://github.com/Dragicafit/Anime-Watch-Parties/releases/download/v0.1.0-beta/Wakanim-With-Friends.crx), go to `chrome://extensions`, enable debugging, drag and drop the crx file.

## Developing or debugging the extension

The [master branch](https://github.com/Dragicafit/Anime-Watch-Parties) generate the firefox extension, the [chrome branch](https://github.com/Dragicafit/Anime-Watch-Parties/tree/chrome) generate the chrome and chromium extension.

This project uses [Node.js](https://nodejs.org/). You have to install it before continuing:

- Linux:
  - go to [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/) and follow instructions to download `Node.js v16.x`.
- Windows:
  - go to [https://nodejs.org/en/download/current/](https://nodejs.org/en/download/current/) to download the Windows Installer.

To install all the depedencies, use the [command `npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) :

```ShellSession
$ npm install
```

Compile the extension:

```ShellSession
$ npm run release
```

Finaly load the extension in your browser:

- Firefox: Go to `about:debugging#/runtime/this-firefox`, click on `Load Temporay Add-on...` and select the folder.
- Chromium: Go to `chrome://extensions`, enable debugging, click on `Load Unpacked` and select the folder.
- Chrome: Go to `chrome://extensions`, enable debugging, click on `Load Unpacked` and select the folder.

## Developing or debugging the server and the extension

The [master branch](https://github.com/Dragicafit/Anime-Watch-Parties) generate the firefox extension, the [chrome branch](https://github.com/Dragicafit/Anime-Watch-Parties/tree/chrome) generate the chrome and chromium extension.

This project uses [Node.js](https://nodejs.org/en/) and [Redis](https://redis.io/). You have to install them before continuing:

- Linux:
  - go to [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/) and follow instructions to download `Node.js v16.x`.
  - install `docker` and `docker-compose` then run `docker-compose up -d` to start the `Redis server`
- Windows:
  - go to [https://nodejs.org/en/download/current/](https://nodejs.org/en/download/current/) to download the Windows Installer.
  - go to [https://docs.docker.com/desktop/windows/install/](https://docs.docker.com/desktop/windows/install/) and follow instructions to download `Docker Desktop` then run `docker-compose up -d` to start the `Redis server`

To install all the depedencies, use the [command `npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) :

```ShellSession
$ npm install
```

First tihngs to do:

- copy the file `.env.example` to `.env`
- modify the url in `src/background-scripts/clientScript.ts` from `https://animewatchparties.com` to `https://localhost:4000`
- run `npm run cert` to create a self-signed certificate (the server uses https)

Compile the extension:

```ShellSession
$ npm run release
```

Then start the server:

```ShellSession
$ npm run debug
```

Finaly load the extension in your browser:

- Firefox: Go to `about:debugging#/runtime/this-firefox`, click on `Load Temporay Add-on...` and select the folder.
- Chromium: Go to `chrome://extensions`, enable debugging, click on `Load Unpacked` and select the folder.
- Chrome: Go to `chrome://extensions`, enable debugging, click on `Load Unpacked` and select the folder.
