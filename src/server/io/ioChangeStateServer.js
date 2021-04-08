const { SocketContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {SocketContext} socketContext @param {IoUtils} ioUtils */
  start: function (socketContext, ioUtils) {
    socketContext.socket.on(
      "changeStateServer",
      (debugSocket, roomnum, state, time, callback) => {
        if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
          debugSocket("roomnum is not a valid string");
          return callback("wrong input");
        }
        if (state !== true && state !== false) {
          debugSocket("state is not boolean");
          return callback("wrong input");
        }
        if (!Number.isFinite(time)) {
          debugSocket("time is not int");
          return callback("wrong input");
        }

        let ioRoom = ioUtils.getIoRoomIfIn(roomnum);
        if (ioRoom == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (socketContext.socket.id !== ioRoom.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${roomnum}`);

        ioRoom.updateState(state, time);
        socketContext.socket
          .to(`room-${roomnum}`)
          .emit("changeStateClient", ioRoom.stateObject);
      }
    );
  },
};
