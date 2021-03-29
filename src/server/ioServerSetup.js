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

        ioDisconnect.start(io, socket, debugDisconnect, updateRoomUsers);
        ioJoinRoom.start(io, socket, syncClient, updateRoomUsers, performance);
        ioChangeStateServer.start(io, socket, performance);
        ioChangeVideoServer.start(io, socket);
        ioSyncClient.start(socket, syncClient);

        function syncClient(debugSocket, callback) {
          if (socket.roomnum == null) {
            debugSocket("socket is not connected to room");
            return callback("access denied");
          }
          let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
          if (room == null) {
            debugSocket("room is null (error server)");
            return callback("error server");
          }
          debugSocket(`applied to room-${socket.roomnum}`);

          if (
            room.currTime != null &&
            room.state != null &&
            room.lastChange != null
          ) {
            debugSocket("change state client");
            let currTime = room.currTime;
            if (room.state) {
              currTime += (performance.now() - room.lastChange) / 1000;
            }
            socket.emit("changeStateClient", {
              time: currTime,
              state: room.state,
            });
          }
          if (room.currVideo != null) {
            debugSocket("change video client");
            socket.emit("changeVideoClient", {
              videoId: room.currVideo,
              site: room.site,
              location: room.location,
            });
          }
        }

        function updateRoomUsers(debugSocket) {
          if (socket.roomnum == null) {
            return debugSocket("socket is not connected to room");
          }
          let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
          if (room == null) {
            return debugSocket("room is null (empty room)");
          }
          debugSocket(`applied to room-${socket.roomnum}`);

          io.sockets.to(`room-${socket.roomnum}`).emit("getUsers", {
            onlineUsers: room.size,
          });
        }
      }
    );
  },
  /** @param {ioServer} io */
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
  supportedEvents: supportedEvents,
};
