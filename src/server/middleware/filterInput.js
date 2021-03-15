"use strict";

const debug = require("debug")("filterInputServerAWP");
const { Socket } = require("socket.io");

const JOIN_ROOM = "joinRoom";
const CHANGE_STATE_SERVER = "changeStateServer";
const CHANGE_VIDEO_SERVER = "changeVideoServer";
const SYNC_CLIENT = "syncClient";

const debugArgument = debug.extend("argument");
const debugJoinRoom = debug.extend(JOIN_ROOM);
const debugChangeStateServer = debug.extend(CHANGE_STATE_SERVER);
const debugChangeVideoServer = debug.extend(CHANGE_VIDEO_SERVER);
const debugSyncClient = debug.extend(SYNC_CLIENT);

module.exports = {
  /** @param {Socket} socket */
  start: function (socket) {
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
        case JOIN_ROOM:
          events[1] = (...args) => {
            debugJoinRoom(`${socket.id}:`, ...args);
          };
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        case CHANGE_STATE_SERVER:
          events[1] = (...args) => {
            debugChangeStateServer(`${socket.id}:`, ...args);
          };
          events[2] = data.state;
          events[3] = data.time;
          events[4] = callback;
          break;
        case CHANGE_VIDEO_SERVER:
          events[1] = (...args) => {
            debugChangeVideoServer(`${socket.id}:`, ...args);
          };
          events[2] = data.videoId;
          events[3] = data.site;
          events[4] = data.location;
          events[5] = callback;
          break;
        case SYNC_CLIENT:
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
  },
  supportedEvents: {
    JOIN_ROOM: JOIN_ROOM,
    CHANGE_STATE_SERVER: CHANGE_STATE_SERVER,
    CHANGE_VIDEO_SERVER: CHANGE_VIDEO_SERVER,
    SYNC_CLIENT: SYNC_CLIENT,
  },
};
