const Utils = require("./utils");

module.exports = {
  /** @param {Utils} utils @param {debug.Debugger} debugDisconnect */
  start: function (utils, debugDisconnect) {
    utils.socket.on("disconnect", () => {
      function debugSocket() {
        debugDisconnect(`${utils.socket.id}:`, ...arguments);
      }
      debugSocket(`${utils.io.sockets.sockets.size} sockets connected`);

      if (utils.socket.roomnum == null) {
        return;
      }
      let room = utils.getRoom();
      if (room == null) {
        return debugSocket("room is null (empty room)");
      }
      if (utils.socket.id === room.host) {
        room.host = undefined;
      }
      debugSocket(`applied to room-${utils.socket.roomnum}`);

      utils.updateRoomUsers(debugSocket);
    });
  },
};
