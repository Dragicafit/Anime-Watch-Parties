const { Server: ioServer, Socket } = require("socket.io");
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
    let room = this.getRoom();
    if (room == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    debugSocket(`applied to room-${this.roomnum}`);

    if (
      room.currTime != null &&
      room.state != null &&
      room.lastChange != null
    ) {
      debugSocket("change state client");
      let currTime = room.currTime;
      if (room.state) {
        currTime += (this.performance.now() - room.lastChange) / 1000;
      }
      this.socket.emit("changeStateClient", {
        time: currTime,
        state: room.state,
      });
    }
    if (room.currVideo != null) {
      debugSocket("change video client");
      this.socket.emit("changeVideoClient", {
        videoId: room.currVideo,
        site: room.site,
        location: room.location,
      });
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

  /** @param String @returns {IoRoom} */
  getRoom(roomnum = this.roomnum) {
    return this.io.sockets.adapter.rooms.get(`room-${roomnum}`);
  }

  get roomnum() {
    return [...this.socket.rooms][1]?.replace(regexPrefix, "");
  }
}

module.exports = IoUtils;
