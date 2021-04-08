const { SocketId } = require("socket.io-adapter");
const { IoContext } = require("./ioContext");

class IoRoom {
  /** @type {IoContext} */
  static ioContext;

  /** @type {SocketId} */
  host;
  /** @type {Boolean} */
  state;
  /** @type {Number} */
  currTime;
  /** @type {Number} */
  lastChange;
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
    this.lastChange = IoRoom.ioContext.performance.now();
  }

  /** @param {String} currVideo @param {String} site @param {String} location */
  updateVideo(currVideo, site, location) {
    this.currVideo = currVideo;
    this.site = site;
    this.location = location;
  }

  isStateDefined() {
    return (
      this.currTime != null && this.state != null && this.lastChange != null
    );
  }

  isVideoDefined() {
    return this.currVideo != null;
  }

  get stateObject() {
    let currTime = this.currTime;
    if (this.state) {
      currTime += (IoRoom.ioContext.performance.now() - this.lastChange) / 1000;
    }
    return {
      state: this.state,
      time: currTime,
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

class Room extends Set {
  /** @type {IoRoom} */
  ioRoom;
}

exports.IoRoom = IoRoom;
exports.Room = Room;
