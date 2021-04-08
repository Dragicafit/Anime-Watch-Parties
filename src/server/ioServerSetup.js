"use strict";

const debug = require("debug")("ioServerAWP");
const { Server: ioServer, Socket } = require("socket.io");
const performance = require("perf_hooks").performance;
const filterInput = require("./middleware/filterInput");
const ioDisconnect = require("./io/ioDisconnect");
const ioChangeVideoServer = require("./io/ioChangeVideoServer");
const ioChangeStateServer = require("./io/ioChangeStateServer");
const ioJoinRoom = require("./io/ioJoinRoom");
const ioSyncClient = require("./io/ioSyncClient");
const { IoRoom } = require("./io/ioRoom");
const { IoContext } = require("./io/ioContext");
const { IoUtils } = require("./io/ioUtils");

const debugConnection = debug.extend("connection");
const debugDisconnect = debug.extend("disconnect");

const supportedEvents = filterInput.supportedEvents;

module.exports = {
  /** @param {ioServer} io */
  start: function (io) {
    IoRoom.ioContext = new IoContext(io, null, performance);

    io.on(
      "connection",
      /** @param {Socket} socket */ (socket) => {
        let debugSocket = (...args) => {
          debugConnection(`${socket.id}:`, ...args);
        };
        debugSocket(`${io.sockets.sockets.size} sockets connected`);

        filterInput.start(socket);

        let ioContext = new IoContext(io, socket, performance);
        let ioUtils = new IoUtils(ioContext);
        ioDisconnect.start(ioContext, ioUtils, debugDisconnect);
        ioJoinRoom.start(ioContext, ioUtils);
        ioChangeStateServer.start(ioContext, ioUtils);
        ioChangeVideoServer.start(ioContext, ioUtils);
        ioSyncClient.start(ioContext, ioUtils);
      }
    );
  },
  /** @param {ioServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
