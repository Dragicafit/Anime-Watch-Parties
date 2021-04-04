const Utils = require("./utils");

module.exports = {
  /** @param {Utils} utils @param {debug.Debugger} debugDisconnect */
  start: function (utils, debugDisconnect) {
    utils.socket.on("disconnect", () => {
      function debugSocket() {
        debugDisconnect(`${utils.socket.id}:`, ...arguments);
      }
      debugSocket(`${utils.io.sockets.sockets.size} sockets connected`);

      let room = utils.getRoom();
      if (room == null) {
        return;
      }
      if (utils.socket.id === room.host) {
        room.host = undefined;
      }
      debugSocket(`applied to room-${utils.roomnum}`);

      utils.updateRoomUsers(debugSocket);
    });
  },
};
