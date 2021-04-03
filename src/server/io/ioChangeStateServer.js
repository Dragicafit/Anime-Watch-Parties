const Room = require("./room");
const Utils = require("./utils");

module.exports = {
  /** @param {Utils} utils */
  start: function (utils) {
    utils.socket.on(
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

        if (utils.socket.roomnum == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        /** @type {Room} */
        let room = utils.getRoom();
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        if (utils.socket.id !== room.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${utils.socket.roomnum}`);

        room.currTime = time;
        room.state = state;
        room.lastChange = utils.performance.now();
        utils.socket.broadcast
          .to(`room-${utils.socket.roomnum}`)
          .emit("changeStateClient", {
            time: room.currTime,
            state: room.state,
          });
      }
    );
  },
};
