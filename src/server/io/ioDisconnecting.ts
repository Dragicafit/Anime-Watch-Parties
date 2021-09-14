import debugModule from "debug";
import { IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

export default {
  start: function (
    socketContext: SocketContext,
    ioUtils: IoUtils,
    debugDisconnecting: debugModule.Debugger
  ) {
    socketContext.socket.on("disconnecting", () => {
      let debugSocket: IoDebugSocket = (...args) => {
        debugDisconnecting(`${socketContext.socket.id}:`, ...args);
      };
      debugSocket(`${socketContext.io.sockets.sockets.size} sockets connected`);

      for (const roomnum of ioUtils.getJoinedRoomnums()) {
        ioUtils.leaveRoom(debugSocket, roomnum);
      }
    });
  },
};
