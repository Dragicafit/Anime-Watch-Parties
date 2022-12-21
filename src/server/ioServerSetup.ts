import debugModule from "debug";
import { performance } from "perf_hooks";
import { Server as IoServer, Socket } from "socket.io";
import ioChangeName from "./io/chat/ioChangeName";
import ioCreateMessageServer from "./io/chat/ioCreateMessageServer";
import ioAskInfo from "./io/ioAskInfo";
import ioAuth from "./io/ioAuth";
import ioChangeStateServer from "./io/ioChangeStateServer";
import ioChangeVideoServer from "./io/ioChangeVideoServer";
import { IoDebugSocket } from "./io/ioConst";
import { IoContext, SocketContext } from "./io/ioContext";
import ioCreateRoom from "./io/ioCreateRoom";
import ioDisconnecting from "./io/ioDisconnecting";
import ioJoinRoom from "./io/ioJoinRoom";
import ioLeaveRoom from "./io/ioLeaveRoom";
import ioReportBug from "./io/ioReportBug";
import { IoRoom } from "./io/ioRoom";
import ioSyncClient from "./io/ioSyncClient";
import { IoUtils } from "./io/ioUtils";
import filterInput from "./middleware/filterInput";

const debug = debugModule("ioServerAWP");

const debugConnection = debug.extend("connection");
const debugDisconnecting = debug.extend("disconnecting");

export default {
  start: function (io: IoServer, jwtSecret: string) {
    IoRoom.ioContext = new IoContext(io, performance, jwtSecret);

    io.on("connection", (socket: Socket) => {
      let debugSocket: IoDebugSocket = (...args) => {
        debugConnection(`${socket.id}:`, ...args);
      };
      debugSocket(`${io.sockets.sockets.size} sockets connected`);

      filterInput.start(socket);

      let socketContext = new SocketContext(io, socket, performance, jwtSecret);
      let ioUtils = new IoUtils(socketContext);
      ioDisconnecting.start(socketContext, ioUtils, debugDisconnecting);
      ioAskInfo.start(socketContext, ioUtils);
      ioAuth.start(socketContext, ioUtils);
      ioCreateRoom.start(socketContext, ioUtils);
      ioJoinRoom.start(socketContext, ioUtils);
      ioLeaveRoom.start(socketContext, ioUtils);
      ioChangeStateServer.start(socketContext, ioUtils);
      ioChangeVideoServer.start(socketContext, ioUtils);
      ioSyncClient.start(socketContext, ioUtils);
      ioReportBug.start(socketContext, ioUtils);
      ioChangeName.start(socketContext, ioUtils);
      ioCreateMessageServer.start(socketContext, ioUtils);
    });
  },
  close: function (io: IoServer) {
    return new Promise((resolve) => io.close(resolve));
  },
};
