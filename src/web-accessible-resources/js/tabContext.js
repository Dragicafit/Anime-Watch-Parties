"use strict";

const { PlayerAWP } = require("./player/PlayerAWP");
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
  /** @type {PlayerAWP} */
  playerAWP;

  /** @param {String} server @param {TabRoom} tabRoom @param {JQueryStatic} $ @param {Window} window */
  constructor(server, tabRoom, $, window) {
    this.server = server;
    this.tabRoom = tabRoom;
    this.$ = $;
    this.window = window;
  }
}

exports.TabContext = TabContext;
