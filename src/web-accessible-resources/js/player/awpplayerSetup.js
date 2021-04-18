"use strict";

const { TabContext } = require("../tabContext");
const { TabSync } = require("../tabSync");
const { awpPlayerInterface } = require("./awpPlayerInterface");

class awpplayerSetup extends awpPlayerInterface {
  /** @type {String} */
  name;
  /** @type {TabContext} */
  tabContext;
  /** @type {TabSync} */
  tabSync;

  /** @param {String} name @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(name, tabContext, tabSync) {
    super();
    this.name = name;
    this.tabContext = tabContext;
    this.tabSync = tabSync;
    this._waitForExist();
  }

  _onPlay(a) {}
  _onPause(a) {}
  _onSeek(a) {}

  onPlay() {
    this._onPlay((e) => {
      console.log(`${this.name} playing`, e);
      if (!this.tabContext.tabRoom.host) return this.tabSync.syncClient();
      this.getTime().then((time) => this.tabSync.sendState(time, true));
    });
  }

  onPause() {
    this._onPause((e) => {
      console.log(`${this.name} pausing`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.getTime().then((time) => this.tabSync.sendState(time, false));
    });
  }

  onSeek() {
    this._onSeek((offset, e) => {
      console.log(`${this.name} seeking ${offset} sec`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.isPlay().then((state) => this.tabSync.sendState(offset, state));
    });
  }

  getTime() {
    if (!this.playerExist()) return Promise.resolve(0);
    return this._getTime();
  }
  _getTime() {
    return Promise.reject(new Error("not initialized"));
  }

  isPlay() {
    if (!this.playerExist()) return Promise.resolve(false);
    return this._isPlay();
  }
  _isPlay() {
    return Promise.reject(new Error("not initialized"));
  }

  seekTo(time) {
    if (!this.playerExist()) return;
    this._seekTo(time);
  }
  _seekTo(time) {}

  setState(state) {
    if (!this.playerExist()) return;
    this._setState(state);
  }
  _setState(state) {}

  playerExist() {
    return false;
  }

  _waitForExist() {
    if (!this.playerExist())
      return setTimeout(this._waitForExist.bind(this), 500);

    this.onPlay();
    this.onPause();
    this.onSeek();
  }
}

exports.awpplayerSetup = awpplayerSetup;
