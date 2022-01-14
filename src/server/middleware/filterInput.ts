import debugModule from "debug";
import { Socket } from "socket.io";
import {
  Data,
  IoCallback,
  IoDebugSocket,
  supportedEvents,
} from "../io/ioConst";

const debug = debugModule("filterInputServerAWP");

const CREATE_ROOM = supportedEvents.CREATE_ROOM;
const JOIN_ROOM = supportedEvents.JOIN_ROOM;
const LEAVE_ROOM = supportedEvents.LEAVE_ROOM;
const CHANGE_STATE_SERVER = supportedEvents.CHANGE_STATE_SERVER;
const CHANGE_VIDEO_SERVER = supportedEvents.CHANGE_VIDEO_SERVER;
const SYNC_CLIENT = supportedEvents.SYNC_CLIENT;
const REPORT_BUG = supportedEvents.REPORT_BUG;
const CHANGE_NAME = supportedEvents.CHANGE_NAME;
const CREATE_MESSAGE_SERVER = supportedEvents.CREATE_MESSAGE_SERVER;

const debugArgument = debug.extend("argument");
const debugCreateRoom = debug.extend(CREATE_ROOM);
const debugJoinRoom = debug.extend(JOIN_ROOM);
const debugLeaveRoom = debug.extend(LEAVE_ROOM);
const debugChangeStateServer = debug.extend(CHANGE_STATE_SERVER);
const debugChangeVideoServer = debug.extend(CHANGE_VIDEO_SERVER);
const debugSyncClient = debug.extend(SYNC_CLIENT);
const debugReportBug = debug.extend(REPORT_BUG);
const debugChangeName = debug.extend(CHANGE_NAME);
const debugCreateMessageServer = debug.extend(CREATE_MESSAGE_SERVER);

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
      let data: Data = {};
      let callback: IoCallback = () => {};

      if (events[1] == null) {
        if (typeof events[2] === "function") {
          callback = events[2];
        }
      } else if (typeof events[1] === "function") {
        callback = events[1];
      } else if (typeof events[1] !== "object") {
        debugSocket("data is not valid");
        if (typeof events[2] === "function") {
          callback = events[2];
          callback("data is not valid");
        }
        return;
      } else {
        data = events[1];
        if (typeof events[2] === "function") {
          callback = events[2];
        }
      }

      switch (event) {
        case CREATE_ROOM:
          events[1] = <IoDebugSocket>((...args) => {
            debugCreateRoom(`${socket.id}:`, ...args);
          });
          events[2] = callback;
          break;
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
        case REPORT_BUG:
          events[1] = <IoDebugSocket>((...args) => {
            debugReportBug(`${socket.id}:`, ...args);
          });
          events[2] = data.logs;
          events[3] = callback;
          break;
        case CHANGE_NAME:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeName(`${socket.id}:`, ...args);
          });
          events[2] = data.name;
          events[3] = callback;
          break;
        case CREATE_MESSAGE_SERVER:
          events[1] = <IoDebugSocket>((...args) => {
            debugCreateMessageServer(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = data.message;
          events[4] = callback;
          break;
        default:
          debugSocket("event is not valid");
          return callback("event is not valid");
      }
      next();
    });
  },
};
