import { Socket } from "socket.io-client";
import { ClientListener } from "./clientListener";
import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export class ClientContext {
  socket: Socket;
  performance: any;
  clientTabs: Map<number, ClientTab>;
  clientRooms: Map<string, ClientRoom>;
  clientListener: ClientListener;

  constructor(
    socket: Socket,
    performance: any,
    clientListener: ClientListener
  ) {
    this.socket = socket;
    this.performance = performance;
    this.clientTabs = new Map();
    this.clientRooms = new Map();
    this.clientListener = clientListener;
  }
}
