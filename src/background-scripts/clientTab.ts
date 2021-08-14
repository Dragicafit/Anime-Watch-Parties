import { ClientContext } from "./clientContext";
import { ClientRoom } from "./clientRoom";

export class ClientTab {
  clientContext: ClientContext;
  roomnum: string | undefined;
  host: boolean | undefined;

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
  }

  get onlineUsers() {
    for (let [
      roomnum,
      clientRoom,
    ] of this.clientContext.clientRooms.entries()) {
      if (roomnum !== this.roomnum) continue;
      return clientRoom.onlineUsers;
    }
  }

  set onlineUsers(val) {
    for (let [
      roomnum,
      clientRoom,
    ] of this.clientContext.clientRooms.entries()) {
      if (roomnum !== this.roomnum) continue;
      clientRoom.onlineUsers = val;
      return;
    }
    let clientRoom2 = new ClientRoom();
    clientRoom2.onlineUsers = val;
    this.clientContext.clientRooms.set(this.roomnum!, clientRoom2);
  }
}
