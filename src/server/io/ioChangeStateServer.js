const IoContext = require("./ioContext");
const IoUtils = require("./ioUtils");

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on(
      "changeStateServer",
      (debugSocket, state, time, callback) => {
        if (state !== true && state !== false) {
          debugSocket("state is not boolean");
          return callback("wrong input");
        }
        if (!Number.isFinite(time)) {
          debugSocket("time is not int");
          return callback("wrong input");
        }

        let ioRoom = ioUtils.getIoRoom();
        if (ioRoom == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (ioContext.socket.id !== ioRoom.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${ioUtils.roomnum}`);

        ioRoom.updateState(state, time);
        ioContext.socket.broadcast
          .to(`room-${ioUtils.roomnum}`)
          .emit("changeStateClient", ioRoom.stateObject);
      }
    );
  },
};
