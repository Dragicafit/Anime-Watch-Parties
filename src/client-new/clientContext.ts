import { Socket } from "socket.io-client";
import { ClientListener } from "./clientListener";
import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export class ClientContext {
  clientTab: ClientTab;
  socket: Socket;
  performance: any;
  clientListener: ClientListener;
  clientRoom?: ClientRoom;
  name?: string;

  constructor(
    socket: Socket,
    performance: any,
    clientListener: ClientListener
  ) {
    this.clientTab = new ClientTab();
    this.socket = socket;
    this.performance = performance;
    this.clientListener = clientListener;
    this.performance = performance;
  }
}
