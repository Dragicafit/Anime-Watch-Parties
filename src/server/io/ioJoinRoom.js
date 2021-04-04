const Room = require("./room");
const Utils = require("./utils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {Utils} utils */
  start: function (utils) {
    utils.socket.on("joinRoom", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      let init = false;
      let newRoomnum = roomnum.toLowerCase();
      let oldRoomnum = utils.roomnum;
      if (oldRoomnum === newRoomnum) {
        return configure();
      }
      if (oldRoomnum != null) {
        utils.socket.leave(`room-${oldRoomnum}`);
        utils.updateRoomUsers(debugSocket);
      }

      init = utils.getRoom(newRoomnum) == null;
      utils.socket.join(`room-${newRoomnum}`);
      configure();

      function configure() {
        debugSocket(`connected to room-${newRoomnum}`);

        let room = utils.getRoom(newRoomnum);
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        if (init) {
          room.currVideo = null;
          room.site = null;
          room.location = null;
          room.state = false;
          room.currTime = 0;
          room.lastChange = utils.performance.now();
        }
        if (room.host == null) {
          debugSocket("socket is host");

          room.host = utils.socket.id;
        }
        if (!init) {
          setTimeout(() => {
            utils.syncClient(debugSocket, () => null);
          }, 1000);
        }
        utils.updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: utils.roomnum,
          host: utils.socket.id === room.host,
        });
      }
    });
  },
};
