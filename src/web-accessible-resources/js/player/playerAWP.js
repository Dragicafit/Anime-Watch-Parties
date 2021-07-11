"use strict";

const { AwpPlayerInterface } = require("./awpPlayerInterface");
const { AwpplayerSetup } = require("./awpplayerSetup");
const { JwplayerSetup } = require("./jwplayerSetup");
const { VilosplayerSetup } = require("./vilosplayerSetup");

class PlayerAWP extends AwpPlayerInterface {
  /** @type {JwplayerSetup} */
  #jwplayer;
  /**  @type {VilosplayerSetup} */
  #vilosplayer;

  /** @param {JwplayerSetup} jwplayer @param {VilosplayerSetup} vilosplayer */
  constructor(jwplayer, vilosplayer) {
    super();
    this.#jwplayer = jwplayer;
    this.#vilosplayer = vilosplayer;
  }

  /** @type {AwpplayerSetup} */
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
