import {
  Data,
  eventsServerReceive,
  IoCallback,
  IoDebugSocket,
} from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      eventsServerReceive.AUTH,
      (debugSocket: IoDebugSocket, callback: IoCallback) => {
        let toCallback: Data = {};
        ioUtils.createJwtToken(toCallback);

        debugSocket(`token generated`);
        callback(null, toCallback);
      }
    );
  },
};
