const IoUtils = require("./ioUtils");

module.exports = {
  /** @param {IoUtils} ioUtils */
  start: function (ioUtils) {
    ioUtils.socket.on(
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

        let room = ioUtils.getRoom();
        if (room == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (ioUtils.socket.id !== room.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${ioUtils.roomnum}`);

        room.currTime = time;
        room.state = state;
        room.lastChange = ioUtils.performance.now();
        ioUtils.socket.broadcast
          .to(`room-${ioUtils.roomnum}`)
          .emit("changeStateClient", {
            time: room.currTime,
            state: room.state,
          });
      }
    );
  },
};
