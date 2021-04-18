"use strict";

const { TabContext } = require("../tabContext");
const { TabSync } = require("../tabSync");
const { awpplayerSetup } = require("./awpplayerSetup");

class jwplayerSetup extends awpplayerSetup {
  /** @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(tabContext, tabSync) {
    super("jwplayer", tabContext, tabSync);
  }

  _onPlay(a) {
    jwplayer().on("play", (e) => {
      if (
        this.tabContext.tabRoom.host ||
        (e.playReason === "interaction" && e.reason === "playing")
      )
        a(e);
    });
  }

  _onPause(a) {
    jwplayer().on("pause", (e) => a(e));
  }

  _onSeek(a) {
    jwplayer().on("seek", (e) => a(e.offset, e));
  }

  _getTime() {
    return Promise.resolve(jwplayer().getPosition());
  }

  _isPlay() {
    return Promise.resolve(jwplayer().getState() === "playing");
  }

  _seekTo(time) {
    jwplayer().seek(time);
  }

  _setState(state) {
    if (state) jwplayer().play();
    else jwplayer().pause();
  }

  playerExist() {
    return typeof jwplayer === "function";
  }
}

exports.jwplayerSetup = jwplayerSetup;
