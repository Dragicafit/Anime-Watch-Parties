const { SocketId } = require("socket.io-adapter");

class IoRoom extends Set {
  /** @type {SocketId} */
  host;
  /** @type {Number} */
  currTime;
  /** @type {Boolean} */
  state;
  /** @type {Number} */
  lastChange;
  /** @type {String} */
  currVideo;
  /** @type {String} */
  site;
  /** @type {String} */
  location;
}

module.exports = IoRoom;
