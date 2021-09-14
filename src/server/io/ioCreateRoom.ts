import { IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

const regexRoom = /^\w{1,30}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "createRoom",
      (debugSocket: IoDebugSocket, callback: IoCallback) => {
        let toCallback: any = {};
        ioUtils.createRoom(debugSocket, callback, toCallback);
        callback(null, toCallback);
      }
    );
  },
};
