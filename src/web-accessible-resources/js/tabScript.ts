"use strict";

const { JwplayerSetup } = require("./player/jwplayerSetup");
const { VilosplayerSetup } = require("./player/vilosplayerSetup");
const $ = require("jquery");
require("./jquery-ui-browserify")($);
const { TabContext } = require("./tabContext");
const { TabSync } = require("./tabSync");
const { TabEvents } = require("./tabEvents");
const { TabUtils } = require("./tabUtils");
const { TabRoom } = require("./tabRoom");
const { TwitchEmbed } = require("./embed/twitchEmbed");
const performance = require("perf_hooks").performance;
const tabTransmission = require("./tabTransmission");
const { PlayerAWP } = require("./player/playerAWP");

let server = "https://localhost:4000";
let streamerDelay = 0;
let popupTwitch;

let tabContext = new TabContext(
  "https://localhost:4000",
  new TabRoom(),
  $,
  window,
  performance
);

let tabSync = new TabSync(tabContext);
tabContext.playerAWP = new PlayerAWP(
  new JwplayerSetup(tabContext, tabSync),
  new VilosplayerSetup(tabContext, tabSync)
);
let tabUtils = new TabUtils(tabContext);
let tabEvents = new TabEvents(tabContext, tabSync);
let twitchEmbed = new TwitchEmbed(tabContext);
tabTransmission.start(tabContext, tabEvents, twitchEmbed);
