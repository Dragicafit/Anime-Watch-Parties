import { Server, Socket } from "socket.io";
import { Performance } from "perf_hooks";

export class IoContext {
  io: Server;
  performance: Performance;

  constructor(io: Server, performance: Performance) {
    this.io = io;
    this.performance = performance;
  }
}

export class SocketContext extends IoContext {
  socket: Socket;

  constructor(io: Server, socket: Socket, performance: Performance) {
    super(io, performance);
    this.socket = socket;
  }
}
