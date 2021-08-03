const { Socket } = require("socket.io-client");
const { ClientTab } = require("./clientTab");
const { ClientRoom } = require("./clientRoom");

class ClientContext {
  /** @type {Socket} */
  socket;
  /** @type {Object} */
  browser;
  /** @type {Map<Number,ClientTab>} */
  clientTabs;
  /** @type {Map<String,ClientRoom>} */
  clientRooms;

  /** @param {Socket} socket @param {Object} browser @param {Map<Number,ClientTab>} clientTabs @param {Map<String,ClientRoom>} clientRooms */
  constructor(socket, browser, clientTabs, clientRooms) {
    this.socket = socket;
    this.browser = browser;
    this.clientTabs = clientTabs;
    this.clientRooms = clientRooms;
  }
}

exports.ClientContext = ClientContext;
