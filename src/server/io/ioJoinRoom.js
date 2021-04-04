const IoUtils = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {IoUtils} ioUtils */
  start: function (ioUtils) {
    ioUtils.socket.on("joinRoom", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      let init = false;
      let newRoomnum = roomnum.toLowerCase();
      let oldRoomnum = ioUtils.roomnum;
      if (oldRoomnum === newRoomnum) {
        return configure();
      }
      if (oldRoomnum != null) {
        ioUtils.socket.leave(`room-${oldRoomnum}`);
        ioUtils.updateRoomUsers(debugSocket);
      }

      init = ioUtils.getRoom(newRoomnum) == null;
      ioUtils.socket.join(`room-${newRoomnum}`);
      configure();

      function configure() {
        debugSocket(`connected to room-${newRoomnum}`);

        let room = ioUtils.getRoom(newRoomnum);
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
          room.lastChange = ioUtils.performance.now();
        }
        if (room.host == null) {
          debugSocket("socket is host");

          room.host = ioUtils.socket.id;
        }
        if (!init) {
          setTimeout(() => {
            ioUtils.syncClient(debugSocket, () => null);
          }, 1000);
        }
        ioUtils.updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: ioUtils.roomnum,
          host: ioUtils.socket.id === room.host,
        });
      }
    });
  },
};
