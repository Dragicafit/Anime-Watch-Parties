import { IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

const regexRoom = /^\w{1,30}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "syncClient",
      (debugSocket: IoDebugSocket, roomnum: any, callback: IoCallback) => {
        if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
          debugSocket("roomnum is not a valid string");
          return callback("wrong input");
        }

        let toCallback: any = {};
        ioUtils.syncClient(debugSocket, roomnum, callback, toCallback);
        callback(null, toCallback);
      }
    );
  },
};
