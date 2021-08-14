import { Socket } from "socket.io-client";
import { ClientTab } from "./clientTab";
import { ClientRoom } from "./clientRoom";

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
