const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils @param {debug.Debugger} debugDisconnect */
  start: function (ioContext, ioUtils, debugDisconnect) {
    ioContext.socket.on("disconnect", () => {
      let debugSocket = (...args) => {
        debugDisconnect(`${ioContext.socket.id}:`, ...args);
      };
      debugSocket(`${ioContext.io.sockets.sockets.size} sockets connected`);

      for (const roomnum of ioUtils.roomnums) {
        let ioRoom = ioUtils.getIoRoom(roomnum);
        if (ioRoom == null) {
          continue;
        }
        if (ioContext.socket.id === ioRoom.host) {
          ioRoom.host = undefined;
        }
        debugSocket(`applied to room-${roomnum}`);

        ioUtils.updateRoomUsers(debugSocket, roomnum);
      }
    });
  },
};
