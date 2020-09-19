# Anime-Watch-Parties

This extension allows you to enjoy your favorite anime on Wakanim with your friends.

## Install

Connect to [the server](https://54.38.185.173:3000) and accept the public key certificate.

- Firefox: Download the [xpi release](https://github.com/Dragicafit/Wakanim-With-Friends/releases/download/v0.2-beta/Wakanim-With-Friends.xpi), go to `about:debugging#/runtime/this-firefox`, click on `Load Temporay Add-on...` and select the xpi file.

- Chromium: Download the [crx release](https://github.com/Dragicafit/Wakanim-With-Friends/releases/download/v0.2-beta/Wakanim-With-Friends.crx), go to `chrome://extensions`, enable debugging, drag and drop the crx file.

- Chrome: Download the [crx release](https://github.com/Dragicafit/Wakanim-With-Friends/releases/download/v0.2-beta/Wakanim-With-Friends.crx), extract the crx file using 7zip, go to `chrome://extensions`, enable debugging, click on `Load unpacked` and select the extracted folder.

## Developing or debugging

This project uses [Node.js](https://nodejs.org/en/).

To install all the depedencies, use the [command `npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) :

```sh
$ npm install
```

Compile the extension:

```sh
$ npm run release
```

Then start the server:

```sh
$ ./script
```

Finaly load the extension in your browser:

- Firefox: Go to `about:debugging#/runtime/this-firefox`, click on `Load Temporay Add-on...` and select the folder.

- Chrome: Go to `chrome://extensions`, enable debugging, click on `Load Unpacked` and select the folder.
