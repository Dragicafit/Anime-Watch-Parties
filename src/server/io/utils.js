const { Server: ioServer, Socket } = require("socket.io");
const Room = require("./room");

class Utils {
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
    if (this.socket.roomnum == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    let room = this.getRoom();
    if (room == null) {
      debugSocket("room is null (error server)");
      return callback("error server");
    }
    debugSocket(`applied to room-${this.socket.roomnum}`);

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
    if (this.socket.roomnum == null) {
      return debugSocket("socket is not connected to room");
    }
    let room = this.getRoom();
    if (room == null) {
      return debugSocket("room is null (empty room)");
    }
    debugSocket(`applied to room-${this.socket.roomnum}`);

    this.io.sockets.to(`room-${this.socket.roomnum}`).emit("getUsers", {
      onlineUsers: room.size,
    });
  }

  /** @param String @returns {Room} */
  getRoom(roomnum = this.socket.roomnum) {
    return this.io.sockets.adapter.rooms.get(`room-${roomnum}`);
  }
}

module.exports = Utils;
