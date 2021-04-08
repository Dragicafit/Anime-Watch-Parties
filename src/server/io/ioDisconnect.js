const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils @param {debug.Debugger} debugDisconnect */
  start: function (ioContext, ioUtils, debugDisconnect) {
    ioContext.socket.on("disconnect", () => {
      function debugSocket() {
        debugDisconnect(`${ioContext.socket.id}:`, ...arguments);
      }
      debugSocket(`${ioContext.io.sockets.sockets.size} sockets connected`);

      let ioRoom = ioUtils.getIoRoom();
      if (ioRoom == null) {
        return;
      }
      if (ioContext.socket.id === ioRoom.host) {
        ioRoom.host = undefined;
      }
      debugSocket(`applied to room-${ioUtils.roomnum}`);

      ioUtils.updateRoomUsers(debugSocket);
    });
  },
};
