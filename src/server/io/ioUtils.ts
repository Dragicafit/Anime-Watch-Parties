import { IoCallback, IoDebugSocket } from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoRoom, Room } from "./ioRoom";

const regexPrefix = /^room-/g;

export class IoUtils {
  socketContext: SocketContext;

  constructor(socketContext: SocketContext) {
    this.socketContext = socketContext;
  }

  syncClient(
    debugSocket: IoDebugSocket,
    roomnum: string,
    callback: IoCallback,
    toCallback: any = {}
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
  }

  updateRoomUsers(
    debugSocket: IoDebugSocket,
    roomnum: string,
    toCallback: any = {}
  ) {
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

  joinRoom(
    debugSocket: IoDebugSocket,
    roomnum: string,
    callback: IoCallback,
    toCallback: any = {}
  ) {
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

  _configure(
    debugSocket: IoDebugSocket,
    roomnum: string,
    callback: IoCallback,
    toCallback: any = {}
  ) {
    debugSocket(`connected to room-${roomnum}`);

    let room = this.getRoom(roomnum);
    if (room == null) {
      debugSocket("room is null (error socket.io)");
      return callback("error server");
    }
    let ioRoom = room.ioRoom;
    if (ioRoom == null) {
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

  leaveRoom(debugSocket: IoDebugSocket, roomnum: string) {
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

  isHost(ioRoom: IoRoom): boolean {
    return this.socketContext.socket.id === ioRoom?.host;
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
    return this.roomnums.includes(roomnum) ? this.getRoom(roomnum) : null;
  }

  getIoRoomIfIn(roomnum: string) {
    return this.roomnums.includes(roomnum) ? this.getIoRoom(roomnum) : null;
  }

  get roomnums() {
    return [...this.socketContext.socket.rooms]
      .slice(1)
      .map((room) => room?.replace(regexPrefix, ""));
  }
}
