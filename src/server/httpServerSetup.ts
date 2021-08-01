"use strict";

const debug = require("debug")("httpServerAWP");
const { Express } = require("express");
const handlebars = require("handlebars");

var template = handlebars.compile(`
<html><head><title>Twitch Auth Sample</title><script>
  opener.postMessage(
    {
      direction: "from-popupTwitch-AWP",
      command: "success",
    },
    "https://www.wakanim.tv"
  );
  opener.postMessage(
    {
      direction: "from-popupTwitch-AWP",
      command: "success",
    },
    "https://www.crunchyroll.com"
  );
  </script></head>
  {{#each auths}}
  <table>
      <tr><th>Provider</th><td>{{provider}}</td></tr>
      <tr><th>Access Token</th><td>{{auth.accessToken}}</td></tr>
      <tr><th>Refresh Token</th><td>{{auth.refreshToken}}</td></tr>
      <tr><th>Display Name</th><td>{{auth.display_name}}</td></tr>
      <tr><th>Id</th><td>{{auth.id}}</td></tr>
  </table>
  {{/each}}
</html>`);

module.exports = {
  /** @param {Express} app */
  start: function (app) {
    app.get("/", function (req, res) {
      let reqSession = req.session;
      let user = reqSession?.passport?.user;
      if (user) {
        let auths = Object.keys(user).map((key) => ({
          provider: key,
          auth: user[key],
        }));
        res.send(template({ auths: auths }));
      } else {
        res.send(
          '<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>'
        );
      }
    });
  },
};
