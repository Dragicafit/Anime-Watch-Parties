const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils @param {debug.Debugger} debugDisconnecting */
  start: function (ioContext, ioUtils, debugDisconnecting) {
    ioContext.socket.on("disconnecting", () => {
      let debugSocket = (...args) => {
        debugDisconnecting(`${ioContext.socket.id}:`, ...args);
      };
      debugSocket(`${ioContext.io.sockets.sockets.size} sockets connected`);

      for (const roomnum of ioUtils.roomnums) {
        ioUtils.leaveRoom(debugSocket, roomnum);
      }
    });
  },
};
