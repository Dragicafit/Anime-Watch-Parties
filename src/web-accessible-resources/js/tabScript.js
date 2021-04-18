"use strict";

const { jwplayerSetup } = require("./player/jwplayerSetup");
const { vilosplayerSetup } = require("./player/vilosplayerSetup");
const $ = require("jquery");
require("./jquery-ui-browserify")($);
const { TabContext } = require("./tabContext");
const { TabSync } = require("./tabSync");
const { TabEvents } = require("./tabEvents");
const { TabUtils } = require("./tabUtils");
const { TabRoom } = require("./tabRoom");
const { TwitchEmbed } = require("./embed/twitchEmbed");
const tabTransmission = require("./tabTransmission");
const { PlayerAWP } = require("./player/PlayerAWP");

let server = "https://localhost:4000";
let streamerDelay = 0;
let popupTwitch;

let tabContext = new TabContext(
  "https://localhost:4000",

  new TabRoom(),
  $,
  window
);

let tabSync = new TabSync(tabContext);
tabContext.playerAWP = new PlayerAWP(
  new jwplayerSetup(tabContext, tabSync),
  new vilosplayerSetup(tabContext, tabSync)
);
let tabUtils = new TabUtils(tabContext);
let tabEvents = new TabEvents(tabContext, tabSync);
let twitchEmbed = new TwitchEmbed(tabContext);
tabTransmission.start(tabContext, tabEvents, twitchEmbed);
