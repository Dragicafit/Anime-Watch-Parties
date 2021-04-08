const { IoRoom } = require("./ioRoom");
const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on("joinRoom", (debugSocket, roomnum, callback) => {
      if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
        debugSocket("roomnum is not a valid string");
        return callback("wrong input");
      }

      let oldRoomnums = ioUtils.roomnums;
      if (oldRoomnums.includes(roomnum)) {
        return configure();
      }
      if (oldRoomnums.length >= 10) {
        debugSocket("too many rooms joined");
        return callback("access denied");
      }

      ioContext.socket.join(`room-${roomnum}`);
      configure();

      function configure() {
        debugSocket(`connected to room-${roomnum}`);

        let room = ioUtils.getRoom(roomnum);
        if (room == null) {
          debugSocket("room is null (error socket.io)");
          return callback("error server");
        }
        /** @type {IoRoom} */
        let ioRoom = room.ioRoom;
        let init = ioRoom == null;
        if (init) {
          ioRoom = room.ioRoom = new IoRoom();
        }
        if (ioRoom.host == null) {
          debugSocket("socket is host");
          ioRoom.host = ioContext.socket.id;
        }
        if (!init) {
          setTimeout(() => {
            ioUtils.syncClient(debugSocket, roomnum, () => {});
          }, 1000);
        }
        ioUtils.updateRoomUsers(debugSocket, roomnum);

        callback(null, {
          roomnum: roomnum,
          host: ioContext.socket.id === ioRoom.host,
        });
      }
    });
  },
};
