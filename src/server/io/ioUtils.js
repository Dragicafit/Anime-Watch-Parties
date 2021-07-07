const { IoRoom, Room } = require("./ioRoom");
const { SocketContext } = require("./ioContext");

const regexPrefix = /^room-/g;

class IoUtils {
  /** @type {SocketContext} */
  socketContext;

  /** @param {SocketContext} socketContext */
  constructor(socketContext) {
    this.socketContext = socketContext;
  }

  syncClient(debugSocket, roomnum, callback, toCallback = {}) {
    let ioRoom = this.getIoRoomIfIn(roomnum);
    if (ioRoom == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    debugSocket(`applied to room-${roomnum}`);

    if (ioRoom.isVideoDefined()) {
      debugSocket("change video client");
      Object.assign(toCallback, ioRoom.videoObject);
    }
    if (ioRoom.isStateDefined()) {
      debugSocket("change state client");
      Object.assign(toCallback, ioRoom.stateObject);
    }
  }

  updateRoomUsers(debugSocket, roomnum, toCallback = {}) {
    let room = this.getRoom(roomnum);
    if (room == null) {
      return debugSocket(`room-${roomnum} has been deleted`);
    }
    debugSocket(`applied to room-${roomnum}`);

    this.socketContext.socket.to(`room-${roomnum}`).emit("getUsers", {
      roomnum: roomnum,
      onlineUsers: room.size,
    });
    toCallback.onlineUsers = room.size;
  }

  joinRoom(debugSocket, roomnum, callback, toCallback = {}) {
    let oldRoomnums = this.roomnums;
    if (oldRoomnums.includes(roomnum)) {
      return this._configure(debugSocket, roomnum, callback, toCallback);
    }
    if (oldRoomnums.length >= 10) {
      debugSocket("too many rooms joined");
      return callback("access denied");
    }

    this.socketContext.socket.join(`room-${roomnum}`);
    this._configure(debugSocket, roomnum, callback, toCallback);

    this.updateRoomUsers(debugSocket, roomnum, toCallback);
  }

  _configure(debugSocket, roomnum, callback, toCallback = {}) {
    debugSocket(`connected to room-${roomnum}`);

    let room = this.getRoom(roomnum);
    if (room == null) {
      debugSocket("room is null (error socket.io)");
      return callback("error server");
    }
    let ioRoom = room.ioRoom;
    let init = ioRoom == null;
    if (init) {
      ioRoom = room.ioRoom = new IoRoom(roomnum);
    }
    if (ioRoom.host == null) {
      debugSocket("socket is host");
      ioRoom.host = this.socketContext.socket.id;
    }

    toCallback.roomnum = roomnum;
    toCallback.host = this.isHost(ioRoom);
    this.syncClient(debugSocket, roomnum, callback, toCallback);
  }

  leaveRoom(debugSocket, roomnum) {
    let ioRoom = this.getIoRoom(roomnum);
    if (ioRoom == null) {
      return;
    }
    if (this.isHost(ioRoom)) {
      ioRoom.host = undefined;
    }
    this.socketContext.socket.leave(`room-${roomnum}`);
    debugSocket(`applied to room-${roomnum}`);

    this.updateRoomUsers(debugSocket, roomnum);
  }

  /** @param {IoRoom} ioRoom @returns {boolean} */
  isHost(ioRoom) {
    return this.socketContext.socket.id === ioRoom?.host;
  }

  /** @param {String} roomnum @returns {Room} */
  getRoom(roomnum) {
    return this.socketContext.io.sockets.adapter.rooms.get(`room-${roomnum}`);
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
    return [...this.socketContext.socket.rooms]
      .slice(1)
      .map((room) => room?.replace(regexPrefix, ""));
  }
}

exports.IoUtils = IoUtils;
