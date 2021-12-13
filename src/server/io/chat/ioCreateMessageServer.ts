import { IoCallback, IoDebugSocket } from "../ioConst";
import { SocketContext } from "../ioContext";
import { IoUtils } from "../ioUtils";

const regexRoom = /^\w{1,30}$/;
const regexMessage = /^.{1,200}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      "createMessageServer",
      (
        debugSocket: IoDebugSocket,
        roomnum: string,
        message: string,
        callback: IoCallback
      ) => {
        if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
          debugSocket("roomnum is not a valid string");
          return callback("wrong input");
        }
        if (typeof message !== "string" || !regexMessage.test(message)) {
          debugSocket("message is not a valid string");
          return callback("wrong input");
        }

        if (socketContext.name == null) {
          debugSocket("sender does not have a name");
          return callback("choose a name");
        }

        let ioRoom = ioUtils.getIoRoomIfIn(roomnum);
        if (ioRoom == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        debugSocket(`applied to room-${roomnum}`);

        ioRoom.messages.push({
          sender: socketContext.socket.id,
          message: message,
        });
        socketContext.socket.to(`room-${roomnum}`).emit("createMessageClient", {
          roomnum: roomnum,
          sender: socketContext.name,
          message: message,
        });

        callback(null, {});
      }
    );
  },
};
