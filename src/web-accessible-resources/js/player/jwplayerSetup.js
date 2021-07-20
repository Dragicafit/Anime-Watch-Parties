"use strict";

const { TabContext } = require("../tabContext");
const { TabSync } = require("../tabSync");
const { AwpplayerSetup } = require("./awpplayerSetup");

class JwplayerSetup extends AwpplayerSetup {
  /** @type {Number} */
  #previousSeek;
  /** @type {Map<String,Number>} */
  #preventCallIfTriggered;

  /** @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(tabContext, tabSync) {
    super("jwplayer", tabContext, tabSync);
    this.#previousSeek = 0;
    this.#preventCallIfTriggered = new Map();
  }

  _onPlay(a) {
    jwplayer().on("play", (e) => {
      if (
        this.tabContext.tabRoom.host ||
        (e.playReason === "interaction" && e.reason === "playing")
      ) {
        if (
          !this.#preventCallIfTriggered.has("play") ||
          this.tabContext.performance.now() -
            this.#preventCallIfTriggered.get("play") >
            200
        ) {
          a(e);
        }
      }
    });
  }

  _onPause(a) {
    jwplayer().on("pause", (e) => {
      if (
        !this.#preventCallIfTriggered.has("pause") ||
        this.tabContext.performance.now() -
          this.#preventCallIfTriggered.get("pause") >
          200
      ) {
        a(e);
      }
    });
  }

  _onSeek(a) {
    jwplayer().on("seek", (e) => {
      if (this.tabContext.window.document.hidden) {
        return;
      }
      if (
        !this.#preventCallIfTriggered.has("seek") ||
        this.tabContext.performance.now() -
          this.#preventCallIfTriggered.get("seek") >
          200
      ) {
        let previousSeek = this.#previousSeek;
        this.#previousSeek = e.offset;
        if (Math.abs(e.offset - previousSeek) < 0.5) return;
        a(e.offset, e);
      }
    });
  }

  _getTime() {
    return Promise.resolve(jwplayer().getPosition());
  }

  _isPlay() {
    return Promise.resolve(jwplayer().getState() === "playing");
  }

  _seekTo(time) {
    this.#preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    jwplayer().seek(time);
  }

  _setState(state) {
    if (state) {
      this.#preventCallIfTriggered.set(
        "play",
        this.tabContext.performance.now()
      );
      jwplayer().play();
    } else {
      this.#preventCallIfTriggered.set(
        "pause",
        this.tabContext.performance.now()
      );
      jwplayer().pause();
    }
  }

  playerExist() {
    return typeof jwplayer === "function";
  }
}

exports.JwplayerSetup = JwplayerSetup;
