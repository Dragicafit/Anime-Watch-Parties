"use strict";

const { TabContext } = require("../tabContext");
const { TabSync } = require("../tabSync");
const { awpplayerSetup } = require("./awpplayerSetup");

class vilosplayerSetup extends awpplayerSetup {
  /** @type {Number} */
  #previousSeek;

  /** @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(tabContext, tabSync) {
    super("vilosplayer", tabContext, tabSync);
    this.#previousSeek = 0;
  }

  _onPlay(a) {
    VILOS_PLAYERJS.on("play", () => a());
  }

  _onPause(a) {
    VILOS_PLAYERJS.on("pause", () => a());
  }

  _onSeek(a) {
    VILOS_PLAYERJS.on("timeupdate", (e) => {
      let previousSeek = this.#previousSeek;
      this.#previousSeek = e.seconds;
      if (Math.abs(e.seconds - previousSeek) < 0.5) return;
      a(e.seconds, e);
    });
  }

  _getTime() {
    return new Promise((resolve) => {
      VILOS_PLAYERJS.getCurrentTime(resolve);
    });
  }

  _isPlay() {
    return new Promise((resolve) => {
      VILOS_PLAYERJS.getPaused((paused) => resolve(paused === false));
    });
  }

  _seekTo(time) {
    VILOS_PLAYERJS.setCurrentTime(time);
  }

  _setState(state) {
    if (state) VILOS_PLAYERJS.play();
    else VILOS_PLAYERJS.pause();
  }

  playerExist() {
    return typeof VILOS_PLAYERJS === "object";
  }
}

exports.vilosplayerSetup = vilosplayerSetup;
