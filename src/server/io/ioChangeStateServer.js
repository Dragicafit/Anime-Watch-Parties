const { Server: ioServer, Socket } = require("socket.io");
const { Performance } = require("perf_hooks");
const Room = require("./room");

module.exports = {
  /** @param {ioServer} io @param {Socket} socket @param {Performance} performance */
  start: function (io, socket, performance) {
    socket.on("changeStateServer", (debugSocket, state, time, callback) => {
      if (state !== true && state !== false) {
        debugSocket("state is not boolean");
        return callback("wrong input");
      }
      if (!Number.isFinite(time)) {
        debugSocket("time is not int");
        return callback("wrong input");
      }

      if (socket.roomnum == null) {
        debugSocket("socket is not connected to room");
        return callback("access denied");
      }
      /** @type {Room} */
      let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
      if (room == null) {
        debugSocket("room is null (error server)");
        return callback("error server");
      }
      if (socket.id !== room.host) {
        debugSocket("socket is not host");
        return callback("access denied");
      }
      debugSocket(`applied to room-${socket.roomnum}`);

      room.currTime = time;
      room.state = state;
      room.lastChange = performance.now();
      socket.broadcast.to(`room-${socket.roomnum}`).emit("changeStateClient", {
        time: room.currTime,
        state: room.state,
      });
    });
  },
};
