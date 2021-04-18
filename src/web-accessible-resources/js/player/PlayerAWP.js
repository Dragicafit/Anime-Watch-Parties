"use strict";

const { awpPlayerInterface } = require("./awpPlayerInterface");
const { awpplayerSetup } = require("./awpplayerSetup");
const { jwplayerSetup } = require("./jwplayerSetup");
const { vilosplayerSetup } = require("./vilosplayerSetup");

class PlayerAWP extends awpPlayerInterface {
  /** @type {jwplayerSetup} */
  #jwplayer;
  /**  @type {vilosplayerSetup} */
  #vilosplayer;

  /** @param {jwplayerSetup} jwplayer @param {vilosplayerSetup} vilosplayer */
  constructor(jwplayer, vilosplayer) {
    super();
    this.#jwplayer = jwplayer;
    this.#vilosplayer = vilosplayer;
  }

  /** @type {awpplayerSetup} */
  get awpplayer() {
    if (this.#jwplayer?.playerExist()) {
      return this.#jwplayer;
    }
    if (this.#vilosplayer?.playerExist()) {
      return this.#vilosplayer;
    }
  }

  onPlay() {
    return this.awpplayer.onPlay();
  }

  onPause() {
    return this.awpplayer.onPause();
  }

  onSeek() {
    return this.awpplayer.onSeek();
  }

  getTime() {
    return this.awpplayer.getTime();
  }

  isPlay() {
    return this.awpplayer.isPlay();
  }

  seekTo(time) {
    return this.awpplayer.seekTo(time);
  }

  setState(state) {
    return this.awpplayer.setState(state);
  }

  playerExist() {
    return this.awpplayer.playerExist();
  }
}

exports.PlayerAWP = PlayerAWP;
