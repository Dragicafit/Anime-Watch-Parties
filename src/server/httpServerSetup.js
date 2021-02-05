const debug = require("debug")("httpServerAWP");
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
<table>
    <tr><th>Access Token</th><td>{{accessToken}}</td></tr>
    <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>
    <tr><th>Display Name</th><td>{{display_name}}</td></tr>
    <tr><th>Id</th><td>{{id}}</td></tr>
</table></html>`);

module.exports = {
  start: function (app) {
    app.get("/", function (req, res) {
      let reqSession = req.session;
      let user = reqSession?.passport?.user;
      if (user) {
        res.send(template(user));
      } else {
        res.send(
          '<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>'
        );
      }
    });
  },
};
