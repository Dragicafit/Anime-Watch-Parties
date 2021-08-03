"use strict";

const { PlayerAWP } = require("./player/playerAWP");
const { TabRoom } = require("./tabRoom");

class TabContext {
  /** @type {String} */
  server;
  /** @type {TabRoom} */
  tabRoom;
  /** @type {JQueryStatic} */
  $;
  /** @type {Window} */
  window;
  /** @type {Performance} */
  performance;
  /** @type {PlayerAWP} */
  playerAWP;

  /** @param {String} server @param {TabRoom} tabRoom @param {JQueryStatic} $ @param {Window} window @param {Performance} performance */
  constructor(server, tabRoom, $, window) {
    this.server = server;
    this.tabRoom = tabRoom;
    this.$ = $;
    this.window = window;
    this.performance = performance;
  }
}

exports.TabContext = TabContext;
