const { Server: ioServer, Socket } = require("socket.io");
const Room = require("./room");

module.exports = {
  /** @param {ioServer} io @param {Socket} socket */
  start: function (io, socket, debugDisconnect, updateRoomUsers) {
    socket.on("disconnect", () => {
      function debugSocket() {
        debugDisconnect(`${socket.id}:`, ...arguments);
      }
      debugSocket(`${io.sockets.sockets.size} sockets connected`);

      if (socket.roomnum == null) {
        return;
      }
      /** @type {Room} */
      let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
      if (room == null) {
        return debugSocket("room is null (empty room)");
      }
      if (socket.id === room.host) {
        room.host = undefined;
      }
      debugSocket(`applied to room-${socket.roomnum}`);

      updateRoomUsers(debugSocket);
    });
  },
};
