const { Server: ioServer, Socket } = require("socket.io");
const Room = require("./room");

module.exports = {
  /** @param {ioServer} io @param {Socket} socket @param {Performance} performance */
  start: function (io, socket, performance) {
    return {
      syncClient: (debugSocket, callback) => {
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
        debugSocket(`applied to room-${socket.roomnum}`);

        if (
          room.currTime != null &&
          room.state != null &&
          room.lastChange != null
        ) {
          debugSocket("change state client");
          let currTime = room.currTime;
          if (room.state) {
            currTime += (performance.now() - room.lastChange) / 1000;
          }
          socket.emit("changeStateClient", {
            time: currTime,
            state: room.state,
          });
        }
        if (room.currVideo != null) {
          debugSocket("change video client");
          socket.emit("changeVideoClient", {
            videoId: room.currVideo,
            site: room.site,
            location: room.location,
          });
        }
      },
      updateRoomUsers: (debugSocket) => {
        if (socket.roomnum == null) {
          return debugSocket("socket is not connected to room");
        }
        /** @type {Room} */
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null) {
          return debugSocket("room is null (empty room)");
        }
        debugSocket(`applied to room-${socket.roomnum}`);

        io.sockets.to(`room-${socket.roomnum}`).emit("getUsers", {
          onlineUsers: room.size,
        });
      },
    };
  },
};
