import { Data, IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "createRoom",
      (debugSocket: IoDebugSocket, callback: IoCallback) => {
        let toCallback: Data = {};
        ioUtils.createRoom(debugSocket, callback, toCallback);
        callback(null, toCallback);
      }
    );
  },
};
