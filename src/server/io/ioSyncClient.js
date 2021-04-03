const Utils = require("./utils");

module.exports = {
  /** @param {Utils} utils */
  start: function (utils) {
    utils.socket.on("syncClient", (debugSocket, callback) =>
      utils.syncClient(debugSocket, callback)
    );
  },
};
