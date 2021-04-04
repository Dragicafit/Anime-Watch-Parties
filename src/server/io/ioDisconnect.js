const IoUtils = require("./ioUtils");

module.exports = {
  /** @param {IoUtils} ioUtils @param {debug.Debugger} debugDisconnect */
  start: function (ioUtils, debugDisconnect) {
    ioUtils.socket.on("disconnect", () => {
      function debugSocket() {
        debugDisconnect(`${ioUtils.socket.id}:`, ...arguments);
      }
      debugSocket(`${ioUtils.io.sockets.sockets.size} sockets connected`);

      let room = ioUtils.getRoom();
      if (room == null) {
        return;
      }
      if (ioUtils.socket.id === room.host) {
        room.host = undefined;
      }
      debugSocket(`applied to room-${ioUtils.roomnum}`);

      ioUtils.updateRoomUsers(debugSocket);
    });
  },
};
