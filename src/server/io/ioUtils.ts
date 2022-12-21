import jwt from "jsonwebtoken";
import { Data, eventsServerSend, IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoRoom, Room } from "./ioRoom";

const regexPrefix = /^room-/g;
const supportedChar =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const maxLengthRoomnum = 5;

export class IoUtils {
  socketContext: SocketContext;

  constructor(socketContext: SocketContext) {
    this.socketContext = socketContext;
  }

  syncClient(
    debugSocket: IoDebugSocket,
    roomnum: string,
    callback: IoCallback,
    toCallback: Data = {}
  ) {
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
    Object.assign(toCallback, {
      messages: ioRoom.messages.map((value) => ({
        sender: value.sender.name,
        message: value.message,
      })),
    });
  }

  updateRoomUsers(
    debugSocket: IoDebugSocket,
    roomnum: string,
    toCallback: Data = {}
  ) {
    let room = this.getRoom(roomnum);
    if (room == null) {
      return debugSocket(`room-${roomnum} has been deleted`);
    }
    debugSocket(`applied to room-${roomnum}`);

    this.socketContext.socket
      .to(`room-${roomnum}`)
      .emit(eventsServerSend.GET_USERS, {
        roomnum: roomnum,
        onlineUsers: room.size,
      });
    toCallback.onlineUsers = room.size;
  }

  createRandomRoomnum(): string {
    let text = "";
    for (let i = 0; i < maxLengthRoomnum; i++)
      text += supportedChar.charAt(
        Math.floor(Math.random() * supportedChar.length)
      );
    return text;
  }

  createRoom(
    debugSocket: IoDebugSocket,
    callback: IoCallback,
    toCallback: Data = {}
  ) {
    let oldJoinedRoomnums = this.getJoinedRoomnums();
    if (oldJoinedRoomnums.length >= 10) {
      debugSocket("too many rooms joined");
      return callback("access denied");
    }
    let roomnum = this.createRandomRoomnum();
    while (this.getRoom(roomnum) != null) {
      roomnum = this.createRandomRoomnum();
    }

    this.socketContext.socket.join(`room-${roomnum}`);
    let room = this.getRoom(roomnum);
    if (room == null) {
      debugSocket("room is null (error socket.io)");
      return callback("error server");
    }
    this._configure(debugSocket, roomnum, room, callback, toCallback);

    this.updateRoomUsers(debugSocket, roomnum, toCallback);
  }

  joinRoom(
    debugSocket: IoDebugSocket,
    oldRoomnum: string,
    oldHost: boolean,
    roomnum: string,
    callback: IoCallback,
    toCallback: Data = {}
  ) {
    let room = this.getRoom(roomnum);
    if (room == null) {
      debugSocket(`room-${roomnum} does not exists`);
      return callback("access denied");
    }
    let oldJoinedRoomnums = this.getJoinedRoomnums();
    if (oldJoinedRoomnums.includes(roomnum)) {
      return this._configure(debugSocket, roomnum, room, callback, toCallback);
    }
    if (oldJoinedRoomnums.length >= 10) {
      debugSocket("too many rooms joined");
      return callback("access denied");
    }

    if (oldRoomnum === roomnum) {
      if (oldHost) {
        debugSocket("socket is host");
        room.ioRoom?.hosts.push(this.socketContext.socket.id);
      }
    }
    this.socketContext.socket.join(`room-${roomnum}`);
    this._configure(debugSocket, roomnum, room, callback, toCallback);

    this.updateRoomUsers(debugSocket, roomnum, toCallback);
  }

  _configure(
    debugSocket: IoDebugSocket,
    roomnum: string,
    room: Room,
    callback: IoCallback,
    toCallback: Data = {}
  ) {
    debugSocket(`connected to room-${roomnum}`);

    if (room.ioRoom == null) {
      room.ioRoom = new IoRoom(roomnum);
    }
    const ioRoom = room.ioRoom;
    if (ioRoom.hosts.length == 0) {
      debugSocket("socket is host");
      ioRoom.hosts.push(this.socketContext.socket.id);
    }

    toCallback.roomnum = roomnum;
    toCallback.host = this.isHost(ioRoom);
    this.syncClient(debugSocket, roomnum, callback, toCallback);
  }

  leaveRoom(debugSocket: IoDebugSocket, roomnum: string) {
    let ioRoom = this.getIoRoom(roomnum);
    if (ioRoom == null) {
      return;
    }

    this.removeHost(ioRoom);
    this.socketContext.socket.leave(`room-${roomnum}`);
    debugSocket(`applied to room-${roomnum}`);

    this.updateRoomUsers(debugSocket, roomnum);
  }

  createJwtToken(toCallback: Data) {
    const name = this.socketContext.name;
    const roomnum = this.getJoinedRoomnums()[0];
    const host = toCallback.host;
    toCallback.token = jwt.sign(
      { name, roomnum, host },
      IoRoom.ioContext.jwtSecret
    );
    toCallback.name = name;
    toCallback.roomnum = roomnum;
  }

  isHost(ioRoom: IoRoom): boolean {
    return ioRoom?.hosts.includes(this.socketContext.socket.id);
  }

  removeHost(ioRoom: IoRoom) {
    ioRoom.hosts = ioRoom.hosts.filter(
      (person) => person != this.socketContext.socket.id
    );
  }

  getRoom(roomnum: string): Room | undefined {
    return <Room | undefined>(
      this.socketContext.io.sockets.adapter.rooms.get(`room-${roomnum}`)
    );
  }

  getIoRoom(roomnum: string) {
    return this.getRoom(roomnum)?.ioRoom;
  }

  getRoomIfIn(roomnum: string) {
    return this.getJoinedRoomnums().includes(roomnum)
      ? this.getRoom(roomnum)
      : null;
  }

  getIoRoomIfIn(roomnum: string) {
    return this.getJoinedRoomnums().includes(roomnum)
      ? this.getIoRoom(roomnum)
      : null;
  }

  getJoinedRoomnums() {
    return [...this.socketContext.socket.rooms]
      .slice(1)
      .map((room) => room?.replace(regexPrefix, ""));
  }
}
