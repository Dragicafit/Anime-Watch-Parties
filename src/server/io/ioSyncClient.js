const { Socket } = require("socket.io");

module.exports = {
  /** @param {Socket} socket */
  start: function (socket, syncClient) {
    socket.on("syncClient", syncClient);
  },
};
