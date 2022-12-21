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
      eventsServerReceive.ASK_INFO,
      (
        debugSocket: IoDebugSocket,
        name: string,
        roomnum: string,
        callback: IoCallback
      ) => {
        let toCallback: Data = {};
        toCallback.name = name;
        toCallback.roomnum = roomnum;

        debugSocket(`token decoded roomnum: room-${roomnum}, name: ${name}`);
        callback(null, toCallback);
      }
    );
  },
};
