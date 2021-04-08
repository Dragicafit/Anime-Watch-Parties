const { SocketContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

module.exports = {
  /** @param {SocketContext} socketContext @param {IoUtils} ioUtils @param {debug.Debugger} debugDisconnecting */
  start: function (socketContext, ioUtils, debugDisconnecting) {
    socketContext.socket.on("disconnecting", () => {
      let debugSocket = (...args) => {
        debugDisconnecting(`${socketContext.socket.id}:`, ...args);
      };
      debugSocket(`${socketContext.io.sockets.sockets.size} sockets connected`);

      for (const roomnum of ioUtils.roomnums) {
        ioUtils.leaveRoom(debugSocket, roomnum);
      }
    });
  },
};
