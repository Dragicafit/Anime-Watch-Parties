"use strict";

const debug = require("debug")("ioServerAWP");
const { Server: IoServer, Socket } = require("socket.io");
const performance = require("perf_hooks").performance;
const filterInput = require("./middleware/filterInput");
const ioDisconnecting = require("./io/ioDisconnecting");
const ioChangeVideoServer = require("./io/ioChangeVideoServer");
const ioChangeStateServer = require("./io/ioChangeStateServer");
const ioJoinRoom = require("./io/ioJoinRoom");
const ioLeaveRoom = require("./io/ioLeaveRoom");
const ioSyncClient = require("./io/ioSyncClient");
const { IoRoom } = require("./io/ioRoom");
const { IoContext, SocketContext } = require("./io/ioContext");
const { IoUtils } = require("./io/ioUtils");

const debugConnection = debug.extend("connection");
const debugDisconnecting = debug.extend("disconnecting");

const supportedEvents = filterInput.supportedEvents;

module.exports = {
  /** @param {IoServer} io */
  start: function (io) {
    IoRoom.ioContext = new IoContext(io, performance);

    io.on(
      "connection",
      /** @param {Socket} socket */ (socket) => {
        let debugSocket = (...args) => {
          debugConnection(`${socket.id}:`, ...args);
        };
        debugSocket(`${io.sockets.sockets.size} sockets connected`);

        filterInput.start(socket);

        let socketContext = new SocketContext(io, socket, performance);
        let ioUtils = new IoUtils(socketContext);
        ioDisconnecting.start(socketContext, ioUtils, debugDisconnecting);
        ioJoinRoom.start(socketContext, ioUtils);
        ioLeaveRoom.start(socketContext, ioUtils);
        ioChangeStateServer.start(socketContext, ioUtils);
        ioChangeVideoServer.start(socketContext, ioUtils);
        ioSyncClient.start(socketContext, ioUtils);
      }
    );
  },
  /** @param {IoServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
