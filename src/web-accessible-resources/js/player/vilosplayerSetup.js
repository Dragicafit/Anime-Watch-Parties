"use strict";

const { TabContext } = require("../tabContext");
const { TabSync } = require("../tabSync");
const { awpplayerSetup } = require("./awpplayerSetup");

class vilosplayerSetup extends awpplayerSetup {
  /** @type {Number} */
  #previousSeek;
  /** @type {Map<String,Number>} */
  #preventCallIfTriggered;

  /** @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(tabContext, tabSync) {
    super("vilosplayer", tabContext, tabSync);
    this.#previousSeek = 0;
    this.#preventCallIfTriggered = new Map();
  }

  _onPlay(a) {
    VILOS_PLAYERJS.on("play", () => {
      if (
        !this.#preventCallIfTriggered.has("play") ||
        this.tabContext.performance.now() -
          this.#preventCallIfTriggered.get("play") >
          200
      ) {
        a();
      }
    });
  }

  _onPause(a) {
    VILOS_PLAYERJS.on("pause", () => {
      if (
        !this.#preventCallIfTriggered.has("pause") ||
        this.tabContext.performance.now() -
          this.#preventCallIfTriggered.get("pause") >
          200
      ) {
        a();
      }
    });
  }

  _onSeek(a) {
    VILOS_PLAYERJS.on("timeupdate", (e) => {
      if (
        !this.#preventCallIfTriggered.has("seek") ||
        this.tabContext.performance.now() -
          this.#preventCallIfTriggered.get("seek") >
          200
      ) {
        let previousSeek = this.#previousSeek;
        this.#previousSeek = e.seconds;
        if (Math.abs(e.seconds - previousSeek) < 0.5) return;
        a(e.seconds, e);
      }
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
    this.#preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    VILOS_PLAYERJS.setCurrentTime(time);
  }

  _setState(state) {
    if (state) {
      this.#preventCallIfTriggered.set(
        "play",
        this.tabContext.performance.now()
      );
      VILOS_PLAYERJS.play();
    } else {
      this.#preventCallIfTriggered.set(
        "pause",
        this.tabContext.performance.now()
      );
      VILOS_PLAYERJS.pause();
    }
  }

  playerExist() {
    return typeof VILOS_PLAYERJS === "object";
  }
}

exports.vilosplayerSetup = vilosplayerSetup;
