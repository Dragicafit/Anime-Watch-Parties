const IoRoom = require("./ioRoom");
const IoContext = require("./ioContext");
const IoUtils = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on("joinRoom", (debugSocket, roomnum, callback) => {
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
        ioContext.socket.leave(`room-${oldRoomnum}`);
        ioUtils.updateRoomUsers(debugSocket);
      }

      ioContext.socket.join(`room-${newRoomnum}`);
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
          ioRoom = room.ioRoom = new IoRoom();
        }
        if (ioRoom.host == null) {
          debugSocket("socket is host");
          ioRoom.host = ioContext.socket.id;
        }
        if (!init) {
          setTimeout(() => {
            ioUtils.syncClient(debugSocket, () => null);
          }, 1000);
        }
        ioUtils.updateRoomUsers(debugSocket);

        callback(null, {
          roomnum: ioUtils.roomnum,
          host: ioContext.socket.id === ioRoom.host,
        });
      }
    });
  },
};
