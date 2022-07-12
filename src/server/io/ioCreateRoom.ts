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
      eventsServerReceive.CREATE_ROOM,
      (debugSocket: IoDebugSocket, callback: IoCallback) => {
        let toCallback: Data = {};
        ioUtils.createRoom(debugSocket, callback, toCallback);
        callback(null, toCallback);
      }
    );
  },
};
