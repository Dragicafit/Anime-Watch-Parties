const { Server: ioServer, Socket, SocketId } = require("socket.io");
const IoRoom = require("./ioRoom");

const regexPrefix = /^room-/g;

class IoUtils {
  /** @type {ioServer} */
  io;
  /** @type {Socket} */
  socket;
  /** @type {Performance} */
  performance;

  /** @param {ioServer} io @param {Socket} socket @param {Performance} performance */
  constructor(io, socket, performance) {
    this.io = io;
    this.socket = socket;
    this.performance = performance;
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
      this.socket.emit("changeStateClient", ioRoom.stateObject);
    }
    if (ioRoom.isVideoDefined()) {
      debugSocket("change video client");
      this.socket.emit("changeVideoClient", ioRoom.videoObject);
    }
  }

  updateRoomUsers(debugSocket) {
    let room = this.getRoom();
    if (room == null) {
      return debugSocket("socket is not connected to room");
    }
    debugSocket(`applied to room-${this.roomnum}`);

    this.io.sockets.to(`room-${this.roomnum}`).emit("getUsers", {
      onlineUsers: room.size,
    });
  }

  /** @param String */
  getRoom(roomnum = this.roomnum) {
    return this.io.sockets.adapter.rooms.get(`room-${roomnum}`);
  }

  /** @param String @returns {IoRoom} */
  getIoRoom(roomnum = this.roomnum) {
    return this.getRoom(roomnum)?.ioRoom;
  }

  get roomnum() {
    return [...this.socket.rooms][1]?.replace(regexPrefix, "");
  }
}

module.exports = IoUtils;
