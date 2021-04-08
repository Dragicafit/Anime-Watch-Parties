const { Server, Socket } = require("socket.io");

class IoContext {
  /** @type {Server} */
  io;
  /** @type {Performance} */
  performance;

  /** @param {Server} io @param {Performance} performance */
  constructor(io, performance) {
    this.io = io;
    this.performance = performance;
  }
}

class SocketContext extends IoContext {
  /** @type {Socket} */
  socket;

  /** @param {Server} io @param {Socket} socket @param {Performance} performance */
  constructor(io, socket, performance) {
    super(io, performance);
    this.socket = socket;
  }
}

exports.IoContext = IoContext;
exports.SocketContext = SocketContext;
