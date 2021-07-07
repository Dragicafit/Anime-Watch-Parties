const { SocketContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {SocketContext} socketContext @param {IoUtils} ioUtils */
  start: function (socketContext, ioUtils) {
    socketContext.socket.on("joinRoom", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      let toCallback = {};
      ioUtils.joinRoom(debugSocket, roomnum, callback, toCallback);
      callback(null, toCallback);
    });
  },
};
