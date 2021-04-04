const IoRoom = require("./ioRoom");
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

      let newRoomnum = roomnum.toLowerCase();
      let oldRoomnum = ioUtils.roomnum;
      if (oldRoomnum === newRoomnum) {
        return configure();
      }
      if (oldRoomnum != null) {
        ioUtils.socket.leave(`room-${oldRoomnum}`);
        ioUtils.updateRoomUsers(debugSocket);
      }

      ioUtils.socket.join(`room-${newRoomnum}`);
      configure();

      function configure() {
        debugSocket(`connected to room-${newRoomnum}`);

        let room = ioUtils.getRoom(newRoomnum);
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        /** @type {IoRoom} */
        let ioRoom = room.ioRoom;
        let init = ioRoom == null;
        if (init) {
          ioRoom = room.ioRoom = new IoRoom(ioUtils);
        }
        if (ioRoom.host == null) {
          debugSocket("socket is host");
          ioRoom.host = ioUtils.socket.id;
        }
        if (!init) {
          setTimeout(() => {
            ioUtils.syncClient(debugSocket, () => null);
          }, 1000);
        }
        ioUtils.updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: ioUtils.roomnum,
          host: ioUtils.socket.id === ioRoom.host,
        });
      }
    });
  },
};
