const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on("syncClient", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      ioUtils.syncClient(debugSocket, roomnum, callback);
    });
  },
};
