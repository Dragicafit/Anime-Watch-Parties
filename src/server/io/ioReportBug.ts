import { IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "reportBug",
      (debugSocket: IoDebugSocket, logs: string[], callback: IoCallback) => {
        if (
          !Array.isArray(logs) ||
          !logs.every((log) => typeof log === "string")
        ) {
          debugSocket("logs is not an array of strings");
          return callback("wrong input");
        }

        debugSocket(logs.slice(-100));

        callback(null, {});
      }
    );
  },
};
