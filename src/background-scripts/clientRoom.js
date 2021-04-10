const { SocketId } = require("socket.io-adapter");

class ClientRoom {
  /** @type {SocketId} */
  host;
  /** @type {Boolean} */
  state;
  /** @type {Number} */
  currTime;
  /** @type {String} */
  currVideo;
  /** @type {String} */
  site;
  /** @type {String} */
  location;

  constructor() {
    this.updateState(false, 0);
  }

  /** @param {Boolean} state @param {Number} currTime */
  updateState(state, currTime) {
    this.state = state;
    this.currTime = currTime;
  }

  /** @param {String} currVideo @param {String} site @param {String} location */
  updateVideo(currVideo, site, location) {
    this.currVideo = currVideo;
    this.site = site;
    this.location = location;
  }

  isStateDefined() {
    return this.currTime != null && this.state != null;
  }

  isVideoDefined() {
    return this.currVideo != null;
  }

  get stateObject() {
    return {
      state: this.state,
      time: this.currTime,
    };
  }

  get videoObject() {
    return {
      videoId: this.currVideo,
      site: this.site,
      location: this.location,
    };
  }
}

exports.ClientRoom = ClientRoom;
