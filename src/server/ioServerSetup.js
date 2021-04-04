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
const IoUtils = require("./io/ioUtils");

const debugConnection = debug.extend("connection");
const debugDisconnect = debug.extend("disconnect");

const supportedEvents = filterInput.supportedEvents;

module.exports = {
  /** @param {ioServer} io */
  start: function (io) {
    io.on(
      "connection",
      /** @param {Socket} socket */ (socket) => {
        let debugSocket = (...args) => {
          debugConnection(`${socket.id}:`, ...args);
        };
        debugSocket(`${io.sockets.sockets.size} sockets connected`);

        filterInput.start(socket);

        let ioUtils = new IoUtils(io, socket, performance);
        ioDisconnect.start(ioUtils, debugDisconnect);
        ioJoinRoom.start(ioUtils);
        ioChangeStateServer.start(ioUtils);
        ioChangeVideoServer.start(ioUtils);
        ioSyncClient.start(ioUtils);
      }
    );
  },
  /** @param {ioServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
