"use strict";

const debug = require("debug")("ioServerAWP");
const { Server: ioServer, Socket } = require("socket.io");
const performance = require("perf_hooks").performance;

const debugConnection = debug.extend("connection");
const debugDisconnect = debug.extend("disconnect");
const debugArgument = debug.extend("argument");
const debugJoinRoom = debug.extend("joinRoom");
const debugChangeStateServer = debug.extend("changeStateServer");
const debugChangeVideoServer = debug.extend("changeVideoServer");
const debugSyncClient = debug.extend("syncClient");

const supportedEvents = [
  "joinRoom",
  "changeStateServer",
  "changeVideoServer",
  "syncClient",
];

const regexRoom = /^\w{1,30}$/;
const regexVideoId = /^[\w\/-]{1,300}$/;
const regexSite = /^(wakanim|crunchyroll)$/;
const regexLocation = /^[a-zA-Z]{2}$/;

module.exports = {
  /** @param {ioServer} io */
  start: function (io) {
    let connections = 0;

    io.on(
      "connection",
      /** @param {Socket} socket */ (socket) => {
        connections++;
        function debugConnection2() {
          debugConnection(`${socket.id}:`, ...arguments);
        }
        debugConnection2(`${connections} sockets connected`);

        socket.use((events, next) => {
          let debugSocket = (...args) => {
            debugArgument(`${socket.id}:`, ...args);
          };
          debugSocket(events);
          let [event, data, callback] = events;
          if (data == null) {
            data = {};
          } else if (typeof data === "function") {
            callback = data;
            data = {};
          } else if (typeof data !== "object") {
            debugSocket("data is not valid");
            return callback("data is not valid");
          }
          if (typeof callback !== "function") {
            callback = () => null;
          }
          switch (event) {
            case "joinRoom":
              events[1] = (...args) => {
                debugJoinRoom(`${socket.id}:`, ...args);
              };
              events[2] = data.roomnum;
              events[3] = callback;
              break;
            case "changeStateServer":
              events[1] = (...args) => {
                debugChangeStateServer(`${socket.id}:`, ...args);
              };
              events[2] = data.state;
              events[3] = data.time;
              events[4] = callback;
              break;
            case "changeVideoServer":
              events[1] = (...args) => {
                debugChangeVideoServer(`${socket.id}:`, ...args);
              };
              events[2] = data.videoId;
              events[3] = data.site;
              events[4] = data.location;
              events[5] = callback;
              break;
            case "syncClient":
              events[1] = (...args) => {
                debugSyncClient(`${socket.id}:`, ...args);
              };
              events[2] = callback;
              break;
            default:
              return callback("event is not valid");
          }
          next();
        });

        socket.on("disconnect", () => {
          connections--;
          function debugSocket() {
            debugDisconnect(`${socket.id}:`, ...arguments);
          }
          debugSocket(`${connections} sockets connected`);

          if (socket.roomnum == null) {
            return;
          }
          let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
          if (room == null) {
            return debugSocket("room is null (empty room)");
          }
          if (socket.id === room.host) {
            room.host = undefined;
          }
          debugSocket(`applied to room-${socket.roomnum}`);

          if (socket.username != null) {
            const index = room.users.indexOf(socket.username);
            if (index > -1) {
              room.users.splice(index, 1);
              updateRoomUsers(debugSocket);
            }
          }
        });

        socket.on("joinRoom", (debugSocket, roomnum, callback) => {
          if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
            debugSocket("roomnum is not a valid string");
            return callback("wrong input");
          }

          if (socket.username == null) {
            debugSocket("socket is not connected");
            return callback("not connected");
          }

          let init = false;
          let newRoomnum = roomnum.toLowerCase();
          if (socket.roomnum === newRoomnum) {
            return configure();
          }
          if (socket.roomnum != null) {
            let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
            if (room == null) {
              debugSocket("room is null (error server)");
              return callback("error server");
            }
            socket.leave(`room-${socket.roomnum}`);
            const index = room.users.indexOf(socket.username);
            if (index > -1) {
              room.users.splice(index, 1);
              updateRoomUsers(debugSocket);
            }
          }

          init = io.sockets.adapter.rooms.get(`room-${newRoomnum}`) == null;
          socket.join(`room-${newRoomnum}`);
          configure();

          function configure() {
            debugSocket(`connected to room-${newRoomnum}`);

            let room = io.sockets.adapter.rooms.get(`room-${newRoomnum}`);
            if (room == null) {
              debugSocket("room is null (error server)");
              return callback("error server");
            }
            if (init) {
              room.currVideo = null;
              room.site = null;
              room.location = null;
              room.users = [socket.username];
              room.hostName = "";
              room.state = false;
              room.currTime = 0;
              room.lastChange = performance.now();
            }
            if (socket.username.toLowerCase() === newRoomnum) {
              debugSocket("socket is host");

              if (room.host != null) {
                socket.broadcast.to(room.host).emit("unSetHost");
              }
              room.host = socket.id;
              room.hostName = socket.username;

              io.sockets.to(`room-${newRoomnum}`).emit("changeHostLabel", {
                username: room.hostName,
              });
            }
            if (!init) {
              if (!room.users.includes(socket.username)) {
                room.users.push(socket.username);
              }
              setTimeout(() => {
                syncClient(debugSocket, () => null);
              }, 1000);
            }
            socket.roomnum = newRoomnum;
            updateRoomUsers(debugSocket);

            callback(null, {
              roomnum: socket.roomnum,
              host: socket.id === room.host,
              username: socket.username,
              hostName: room.hostName,
            });
          }
        });

        socket.on("changeStateServer", (debugSocket, state, time, callback) => {
          if (typeof state !== "boolean") {
            debugSocket("state is not boolean");
            return callback("wrong input");
          }
          if (!Number.isFinite(time)) {
            debugSocket("time is not int");
            return callback("wrong input");
          }

          if (socket.roomnum == null) {
            debugSocket("socket is not connected to room");
            return callback("access denied");
          }
          let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
          if (room == null) {
            debugSocket("room is null (error server)");
            return callback("error server");
          }
          if (socket.id !== room.host) {
            debugSocket("socket is not host");
            return callback("access denied");
          }
          debugSocket(`applied to room-${socket.roomnum}`);

          room.currTime = time;
          room.state = state;
          room.lastChange = performance.now();
          socket.broadcast
            .to(`room-${socket.roomnum}`)
            .emit("changeStateClient", {
              time: room.currTime,
              state: room.state,
            });
        });

        socket.on(
          "changeVideoServer",
          (debugSocket, videoId, site, location, callback) => {
            if (typeof videoId !== "string" || !regexVideoId.test(videoId)) {
              debugSocket("videoId is not a valid string");
              return callback("wrong input");
            }
            if (typeof site !== "string" || !regexSite.test(site)) {
              debugSocket("site is not a valid string");
              return callback("wrong input");
            }
            if (typeof location !== "string" || !regexLocation.test(location)) {
              debugSocket("location is not a valid string");
              return callback("wrong input");
            }

            if (socket.roomnum == null) {
              debugSocket("socket is not connected to room");
              return callback("access denied");
            }
            let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
            if (room == null) {
              debugSocket("room is null (error server)");
              return callback("error server");
            }
            if (socket.id !== room.host) {
              debugSocket("socket is not host");
              return callback("access denied");
            }
            debugSocket(`applied to room-${socket.roomnum}`);

            room.currVideo = videoId;
            room.site = site;
            room.location = location;
            socket.broadcast
              .to(`room-${socket.roomnum}`)
              .emit("changeVideoClient", {
                videoId: room.currVideo,
                site: room.site,
                location: room.location,
              });
          }
        );

        socket.on("syncClient", syncClient);

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
            onlineUsers: room.users.length,
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
