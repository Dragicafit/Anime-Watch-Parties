import { Performance } from "perf_hooks";
import { Server, Socket } from "socket.io";

export class IoContext {
  io: Server;
  performance: Performance;
  jwtSecret: string;

  constructor(io: Server, performance: Performance, jwtSecret: string) {
    this.io = io;
    this.performance = performance;
    this.jwtSecret = jwtSecret;
  }
}

export class SocketContext extends IoContext {
  socket: Socket;
  name: string | undefined;

  constructor(
    io: Server,
    socket: Socket,
    performance: Performance,
    jwtSecret: string
  ) {
    super(io, performance, jwtSecret);
    this.socket = socket;
  }
}
