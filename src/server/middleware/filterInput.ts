import debugModule from "debug";
import { Socket } from "socket.io";
import { IoCallback, IoDebugSocket, supportedEvents } from "../io/ioConst";

const debug = debugModule("filterInputServerAWP");

const JOIN_ROOM = supportedEvents.JOIN_ROOM;
const LEAVE_ROOM = supportedEvents.LEAVE_ROOM;
const CHANGE_STATE_SERVER = supportedEvents.CHANGE_STATE_SERVER;
const CHANGE_VIDEO_SERVER = supportedEvents.CHANGE_VIDEO_SERVER;
const SYNC_CLIENT = supportedEvents.SYNC_CLIENT;

const debugArgument = debug.extend("argument");
const debugJoinRoom = debug.extend(JOIN_ROOM);
const debugLeaveRoom = debug.extend(LEAVE_ROOM);
const debugChangeStateServer = debug.extend(CHANGE_STATE_SERVER);
const debugChangeVideoServer = debug.extend(CHANGE_VIDEO_SERVER);
const debugSyncClient = debug.extend(SYNC_CLIENT);

export default {
  start: (socket: Socket) => {
    socket.use((events, next) => {
      let debugSocket: IoDebugSocket = (...args) => {
        debugArgument(`${socket.id}:`, ...args);
      };
      debugSocket(events);

      if (typeof events[0] !== "string") {
        debugSocket("event is not valid");
        return;
      }

      let event = events[0];
      let data: any;
      let callback: IoCallback = () => {};

      if (events[1] == null) {
        data = {};
        if (typeof events[2] === "function") {
          callback = events[2];
        }
      } else if (typeof events[1] === "function") {
        data = {};
        callback = events[1];
      } else if (typeof events[1] !== "object") {
        debugSocket("data is not valid");
        if (typeof events[2] === "function") {
          events[2]("data is not valid");
        }
        return;
      } else {
        data = events[1];
        if (typeof events[2] === "function") {
          callback = events[2];
        }
      }

      switch (event) {
        case JOIN_ROOM:
          events[1] = <IoDebugSocket>((...args) => {
            debugJoinRoom(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        case LEAVE_ROOM:
          events[1] = <IoDebugSocket>((...args) => {
            debugLeaveRoom(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        case CHANGE_STATE_SERVER:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeStateServer(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = data.state;
          events[4] = data.time;
          events[5] = callback;
          break;
        case CHANGE_VIDEO_SERVER:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeVideoServer(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = data.videoId;
          events[4] = data.site;
          events[5] = data.location;
          events[6] = callback;
          break;
        case SYNC_CLIENT:
          events[1] = <IoDebugSocket>((...args) => {
            debugSyncClient(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        default:
          debugSocket("event is not valid");
          return callback("event is not valid");
      }
      next();
    });
  },
};
