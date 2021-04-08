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

  syncClient(debugSocket, callback) {
    let ioRoom = this.getIoRoom();
    if (ioRoom == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    debugSocket(`applied to room-${this.roomnum}`);

    if (ioRoom.isStateDefined()) {
      debugSocket("change state client");
      this.ioContext.socket.emit("changeStateClient", ioRoom.stateObject);
    }
    if (ioRoom.isVideoDefined()) {
      debugSocket("change video client");
      this.ioContext.socket.emit("changeVideoClient", ioRoom.videoObject);
    }
  }

  updateRoomUsers(debugSocket) {
    let room = this.getRoom();
    if (room == null) {
      return debugSocket("socket is not connected to room");
    }
    debugSocket(`applied to room-${this.roomnum}`);

    this.ioContext.io.sockets.to(`room-${this.roomnum}`).emit("getUsers", {
      onlineUsers: room.size,
    });
  }

  /** @param {String} roomnum @returns {Room} */
  getRoom(roomnum = this.roomnum) {
    return this.ioContext.io.sockets.adapter.rooms.get(`room-${roomnum}`);
  }

  /** @param {String} roomnum @returns {IoRoom} */
  getIoRoom(roomnum = this.roomnum) {
    return this.getRoom(roomnum)?.ioRoom;
  }

  get roomnum() {
    return [...this.ioContext.socket.rooms][1]?.replace(regexPrefix, "");
  }
}

exports.IoUtils = IoUtils;
