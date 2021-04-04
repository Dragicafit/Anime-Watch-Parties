const IoUtils = require("./ioUtils");

module.exports = {
  /** @param {IoUtils} ioUtils */
  start: function (ioUtils) {
    ioUtils.socket.on("syncClient", (debugSocket, callback) =>
      ioUtils.syncClient(debugSocket, callback)
    );
  },
};
