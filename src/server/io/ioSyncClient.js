const IoContext = require("./ioContext");
const IoUtils = require("./ioUtils");

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on("syncClient", (debugSocket, callback) =>
      ioUtils.syncClient(debugSocket, callback)
    );
  },
};
