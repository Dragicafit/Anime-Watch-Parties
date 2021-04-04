const { Server: ioServer, Socket } = require("socket.io");

class IoContext {
  /** @type {ioServer} */
  io;
  /** @type {Socket} */
  socket;
  /** @type {Performance} */
  performance;

  /** @param {ioServer} io @param {Socket} socket @param {Performance} performance */
  constructor(io, socket, performance) {
    this.io = io;
    this.socket = socket;
    this.performance = performance;
  }
}

module.exports = IoContext;
