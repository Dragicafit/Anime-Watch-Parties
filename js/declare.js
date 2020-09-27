let $2 = $.noConflict(true);
let server = "https://localhost:4000";
let socket = io.connect(server, { secure: true });
let roomnum = "";
let username = "";
let host = false;
let hostName = "";
let onlineUsers = 0;
let parseUrlWakanim = /^https:\/\/www\.wakanim\.tv\/(?<location>\w+)\/v2\/\w+\/episode\/(?<videoId>\d+)/;
let parseUrlCrunchyroll = /^https:\/\/www\.crunchyroll\.com\/(?<location>\w+)\/(?<videoId>[\w\/-]+)/;
let delay = 0;
let streamerDelay = 0;
let popupTwitch;
let player;

switch (window.location.hostname) {
  case "www.wakanim.tv":
    player = new jwplayerSetup();
    break;
  case "www.crunchyroll.com":
    player = new vilosplayerSetup();
    break;
  default:
    throw new Error("invalid url");
}
