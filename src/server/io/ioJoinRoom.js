const { Server: ioServer, Socket } = require("socket.io");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {ioServer} io @param {Socket} socket */
  start: function (io, socket, syncClient, updateRoomUsers, performance) {
    socket.on("joinRoom", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      let init = false;
      let newRoomnum = roomnum.toLowerCase();
      if (socket.roomnum === newRoomnum) {
        return configure();
      }
      if (socket.roomnum != null) {
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        socket.leave(`room-${socket.roomnum}`);
        updateRoomUsers(debugSocket);
      }

      init = io.sockets.adapter.rooms.get(`room-${newRoomnum}`) == null;
      socket.join(`room-${newRoomnum}`);
      configure();

      function configure() {
        debugSocket(`connected to room-${newRoomnum}`);

        let room = io.sockets.adapter.rooms.get(`room-${newRoomnum}`);
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        if (init) {
          room.currVideo = null;
          room.site = null;
          room.location = null;
          room.state = false;
          room.currTime = 0;
          room.lastChange = performance.now();
        }
        if (room.host == null) {
          debugSocket("socket is host");

          room.host = socket.id;
        }
        if (!init) {
          setTimeout(() => {
            syncClient(debugSocket, () => null);
          }, 1000);
        }
        socket.roomnum = newRoomnum;
        updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: socket.roomnum,
          host: socket.id === room.host,
        });
      }
    });
  },
};
