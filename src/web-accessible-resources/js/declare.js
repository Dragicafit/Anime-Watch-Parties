let $2 = $.noConflict(true);
let server = "https://localhost:4000";
let roomnum = "";
let host = false;
let delay = 0;
let streamerDelay = 0;
let popupTwitch;
let awpplayer;

switch (window.location.hostname) {
  case "www.wakanim.tv":
    awpplayer = new jwplayerSetup();
    break;
  case "www.crunchyroll.com":
    awpplayer = new vilosplayerSetup();
    break;
  default:
    throw new Error("invalid url");
}
