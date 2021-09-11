import { Socket } from "socket.io-client";
import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export class ClientContext {
  socket: Socket;
  clientTabs: Map<number, ClientTab>;
  clientRooms: Map<string, ClientRoom>;

  constructor(
    socket: Socket,
    clientTabs: Map<number, ClientTab>,
    clientRooms: Map<string, ClientRoom>
  ) {
    this.socket = socket;
    this.clientTabs = clientTabs;
    this.clientRooms = clientRooms;
  }
}
