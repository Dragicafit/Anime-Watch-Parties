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

  syncClient(debugSocket, roomnum, callback) {
    let ioRoom = this.getIoRoomIfIn(roomnum);
    if (ioRoom == null) {
      debugSocket("socket is not connected to room");
      return callback("access denied");
    }
    debugSocket(`applied to room-${roomnum}`);

    if (ioRoom.isStateDefined()) {
      debugSocket("change state client");
      this.socketContext.socket.emit("changeStateClient", ioRoom.stateObject);
    }
    if (ioRoom.isVideoDefined()) {
      debugSocket("change video client");
      this.socketContext.socket.emit("changeVideoClient", ioRoom.videoObject);
    }
  }

  updateRoomUsers(debugSocket, roomnum) {
    let room = this.getRoomIfIn(roomnum);
    if (room == null) {
      return debugSocket("socket is not connected to room");
    }
    debugSocket(`applied to room-${roomnum}`);

    this.socketContext.io.sockets.to(`room-${roomnum}`).emit("getUsers", {
      roomnum: roomnum,
      onlineUsers: room.size,
    });
  }

  joinRoom(debugSocket, roomnum, callback) {
    let oldRoomnums = this.roomnums;
    if (oldRoomnums.includes(roomnum)) {
      return this._configure(debugSocket, roomnum, callback);
    }
    if (oldRoomnums.length >= 10) {
      debugSocket("too many rooms joined");
      return callback("access denied");
    }

    this.socketContext.socket.join(`room-${roomnum}`);
    this._configure(debugSocket, roomnum, callback);

    setTimeout(() => {
      this.syncClient(debugSocket, roomnum, () => {});
    }, 1000);
    this.updateRoomUsers(debugSocket, roomnum);
  }

  _configure(debugSocket, roomnum, callback) {
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

    callback(null, {
      roomnum: roomnum,
      host: this.isHost(ioRoom),
    });
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
