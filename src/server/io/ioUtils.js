const { IoRoom, Room } = require("./ioRoom");
const { IoContext } = require("./ioContext");

const regexPrefix = /^room-/g;

class IoUtils {
  /** @type {IoContext} */
  ioContext;

  /** @param {IoContext} ioContext */
  constructor(ioContext) {
    this.ioContext = ioContext;
  }

  syncClient(debugSocket, roomnum, callback) {
    let ioRoom = this.getIoRoomIfIn(roomnum);
    if (ioRoom == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    debugSocket(`applied to room-${roomnum}`);

    if (ioRoom.isStateDefined()) {
      debugSocket("change state client");
      this.ioContext.socket.emit("changeStateClient", ioRoom.stateObject);
    }
    if (ioRoom.isVideoDefined()) {
      debugSocket("change video client");
      this.ioContext.socket.emit("changeVideoClient", ioRoom.videoObject);
    }
  }

  updateRoomUsers(debugSocket, roomnum) {
    let room = this.getRoomIfIn(roomnum);
    if (room == null) {
      return debugSocket("socket is not connected to room");
    }
    debugSocket(`applied to room-${roomnum}`);

    this.ioContext.io.sockets.to(`room-${roomnum}`).emit("getUsers", {
      onlineUsers: room.size,
    });
  }

  /** @param {String} roomnum @returns {Room} */
  getRoom(roomnum) {
    return this.ioContext.io.sockets.adapter.rooms.get(`room-${roomnum}`);
  }

  /** @param {String} roomnum */
  getIoRoom(roomnum) {
    return this.getRoom(roomnum)?.ioRoom;
  }

  /** @param {String} roomnum */
  getRoomIfIn(roomnum) {
    return this.roomnums.includes(roomnum) ? this.getRoom(roomnum) : null;
  }

  /** @param {String} roomnum */
  getIoRoomIfIn(roomnum) {
    return this.roomnums.includes(roomnum) ? this.getIoRoom(roomnum) : null;
  }

  get roomnums() {
    return [...this.ioContext.socket.rooms]
      .slice(1)
      .map((room) => room?.replace(regexPrefix, ""));
  }
}

exports.IoUtils = IoUtils;
