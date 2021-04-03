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
const Utils = require("./io/utils");

const debugConnection = debug.extend("connection");
const debugDisconnect = debug.extend("disconnect");

const supportedEvents = filterInput.supportedEvents;

module.exports = {
  /** @param {ioServer} io */
  start: function (io) {
    io.on(
      "connection",
      /** @param {Socket} socket */ (socket) => {
        function debugConnection2() {
          debugConnection(`${socket.id}:`, ...arguments);
        }
        debugConnection2(`${io.sockets.sockets.size} sockets connected`);

        filterInput.start(socket);

        let utils = new Utils(io, socket, performance);
        ioDisconnect.start(utils, debugDisconnect);
        ioJoinRoom.start(utils);
        ioChangeStateServer.start(utils);
        ioChangeVideoServer.start(utils);
        ioSyncClient.start(utils);
      }
    );
  },
  /** @param {ioServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
