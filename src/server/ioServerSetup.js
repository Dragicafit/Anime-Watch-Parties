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
const utils = require("./io/utils");

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

        let { syncClient, updateRoomUsers } = utils.start(io, socket);
        ioDisconnect.start(io, socket, debugDisconnect, updateRoomUsers);
        ioJoinRoom.start(io, socket, syncClient, updateRoomUsers, performance);
        ioChangeStateServer.start(io, socket, performance);
        ioChangeVideoServer.start(io, socket);
        ioSyncClient.start(socket, syncClient);
      }
    );
  },
  /** @param {ioServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
