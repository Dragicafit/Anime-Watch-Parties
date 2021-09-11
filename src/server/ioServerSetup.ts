import debugModule from "debug";
import { performance } from "perf_hooks";
import { Server as IoServer, Socket } from "socket.io";
import ioChangeStateServer from "./io/ioChangeStateServer";
import ioChangeVideoServer from "./io/ioChangeVideoServer";
import { IoDebugSocket } from "./io/ioConst";
import { IoContext, SocketContext } from "./io/ioContext";
import ioDisconnecting from "./io/ioDisconnecting";
import ioJoinRoom from "./io/ioJoinRoom";
import ioLeaveRoom from "./io/ioLeaveRoom";
import { IoRoom } from "./io/ioRoom";
import ioSyncClient from "./io/ioSyncClient";
import { IoUtils } from "./io/ioUtils";
import filterInput from "./middleware/filterInput";

const debug = debugModule("ioServerAWP");

const debugConnection = debug.extend("connection");
const debugDisconnecting = debug.extend("disconnecting");

export default {
  start: function (io: IoServer) {
    IoRoom.ioContext = new IoContext(io, performance);

    io.on("connection", (socket: Socket) => {
      let debugSocket: IoDebugSocket = (...args) => {
        debugConnection(`${socket.id}:`, ...args);
      };
      debugSocket(`${io.sockets.sockets.size} sockets connected`);

      filterInput.start(socket);

      let socketContext = new SocketContext(io, socket, performance);
      let ioUtils = new IoUtils(socketContext);
      ioDisconnecting.start(socketContext, ioUtils, debugDisconnecting);
      ioJoinRoom.start(socketContext, ioUtils);
      ioLeaveRoom.start(socketContext, ioUtils);
      ioChangeStateServer.start(socketContext, ioUtils);
      ioChangeVideoServer.start(socketContext, ioUtils);
      ioSyncClient.start(socketContext, ioUtils);
    });
  },
  close: function (io: IoServer) {
    return new Promise((resolve) => io.close(resolve));
  },
};
