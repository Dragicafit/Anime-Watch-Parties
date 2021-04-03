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
      if (utils.socket.roomnum === newRoomnum) {
        return configure();
      }
      if (utils.socket.roomnum != null) {
        let room = utils.getRoom();
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        utils.socket.leave(`room-${utils.socket.roomnum}`);
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
        utils.socket.roomnum = newRoomnum;
        utils.updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: utils.socket.roomnum,
          host: utils.socket.id === room.host,
        });
      }
    });
  },
};
