import debugModule from "debug";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import {
  Data,
  eventsServerReceive,
  IoCallback,
  IoDebugSocket,
} from "../io/ioConst";
import { IoRoom } from "../io/ioRoom";

const debug = debugModule("filterInputServerAWP");

const debugArgument = debug.extend("argument");
const debugAskInfo = debug.extend(eventsServerReceive.ASK_INFO);
const debugAuth = debug.extend(eventsServerReceive.AUTH);
const debugCreateRoom = debug.extend(eventsServerReceive.CREATE_ROOM);
const debugJoinRoom = debug.extend(eventsServerReceive.JOIN_ROOM);
const debugLeaveRoom = debug.extend(eventsServerReceive.LEAVE_ROOM);
const debugChangeStateServer = debug.extend(
  eventsServerReceive.CHANGE_STATE_SERVER
);
const debugChangeVideoServer = debug.extend(
  eventsServerReceive.CHANGE_VIDEO_SERVER
);
const debugSyncClient = debug.extend(eventsServerReceive.SYNC_CLIENT);
const debugReportBug = debug.extend(eventsServerReceive.REPORT_BUG);
const debugChangeName = debug.extend(eventsServerReceive.CHANGE_NAME);
const debugCreateMessageServer = debug.extend(
  eventsServerReceive.CREATE_MESSAGE_SERVER
);

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
        case eventsServerReceive.ASK_INFO:
          events[1] = <IoDebugSocket>((...args) => {
            debugAskInfo(`${socket.id}:`, ...args);
          });
          const { name, roomnum } = jwt.verify(
            data.token!,
            IoRoom.ioContext.jwtSecret
          ) as any;
          events[2] = name;
          events[3] = roomnum;
          events[4] = callback;
          break;
        case eventsServerReceive.AUTH:
          events[1] = <IoDebugSocket>((...args) => {
            debugAuth(`${socket.id}:`, ...args);
          });
          events[2] = callback;
          break;
        case eventsServerReceive.CREATE_ROOM:
          events[1] = <IoDebugSocket>((...args) => {
            debugCreateRoom(`${socket.id}:`, ...args);
          });
          events[2] = callback;
          break;
        case eventsServerReceive.JOIN_ROOM: {
          const { host, roomnum } = jwt.verify(
            data.token!,
            IoRoom.ioContext.jwtSecret
          ) as any;
          events[1] = <IoDebugSocket>((...args) => {
            debugJoinRoom(`${socket.id}:`, ...args);
          });
          events[2] = roomnum;
          events[3] = host;
          events[4] = data.roomnum;
          events[5] = callback;
          break;
        }
        case eventsServerReceive.LEAVE_ROOM:
          events[1] = <IoDebugSocket>((...args) => {
            debugLeaveRoom(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        case eventsServerReceive.CHANGE_STATE_SERVER:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeStateServer(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = data.state;
          events[4] = data.time;
          events[5] = callback;
          break;
        case eventsServerReceive.CHANGE_VIDEO_SERVER:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeVideoServer(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = data.videoId;
          events[4] = data.site;
          events[5] = data.location;
          events[6] = callback;
          break;
        case eventsServerReceive.SYNC_CLIENT:
          events[1] = <IoDebugSocket>((...args) => {
            debugSyncClient(`${socket.id}:`, ...args);
          });
          events[2] = data.roomnum;
          events[3] = callback;
          break;
        case eventsServerReceive.REPORT_BUG:
          events[1] = <IoDebugSocket>((...args) => {
            debugReportBug(`${socket.id}:`, ...args);
          });
          events[2] = data.logs;
          events[3] = callback;
          break;
        case eventsServerReceive.CHANGE_NAME:
          events[1] = <IoDebugSocket>((...args) => {
            debugChangeName(`${socket.id}:`, ...args);
          });
          events[2] = data.name;
          events[3] = callback;
          break;
        case eventsServerReceive.CREATE_MESSAGE_SERVER:
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
