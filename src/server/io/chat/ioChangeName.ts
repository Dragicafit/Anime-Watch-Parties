import { IoCallback, IoDebugSocket } from "../ioConst";
import { SocketContext } from "../ioContext";
import { IoUtils } from "../ioUtils";

const regexName = /^\w{3,20}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "changeName",
      (debugSocket: IoDebugSocket, name: string, callback: IoCallback) => {
        if (typeof name !== "string" || !regexName.test(name)) {
          debugSocket("name is not a valid string");
          return callback("wrong input");
        }

        socketContext.name = name;

        callback(null, {});
      }
    );
  },
};
