import {
  Data,
  eventsServerReceive,
  IoCallback,
  IoDebugSocket,
} from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

const regexRoom = /^\w{1,30}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      eventsServerReceive.JOIN_ROOM,
      (debugSocket: IoDebugSocket, roomnum: string, callback: IoCallback) => {
        if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
          debugSocket("roomnum is not a valid string");
          return callback("wrong input");
        }

        let toCallback: Data = {};
        ioUtils.joinRoom(debugSocket, roomnum, callback, toCallback);
        callback(null, toCallback);
      }
    );
  },
};
