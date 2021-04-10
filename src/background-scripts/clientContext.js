const { Socket } = require("socket.io-client");
const { ClientRoom } = require("./clientRoom");

class ClientContext {
  /** @type {Socket} */
  socket;
  /** @type {Object} */
  browser;
  /** @type {Map<Number,ClientRoom>} */
  infoTabs;

  /** @param {Socket} socket @param {Object} browser */
  constructor(socket, browser) {
    this.socket = socket;
    this.browser = browser;
    this.infoTabs = new Map();
  }
}

exports.ClientContext = ClientContext;
