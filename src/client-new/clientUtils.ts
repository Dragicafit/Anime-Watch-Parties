import { eventsServerSend } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export class ClientUtils {
  private clientContext: ClientContext;
  private logs: string[];

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
    this.logs = [];
  }

  private createRoom(roomnum: string): ClientRoom {
    let clientRoom = this.clientContext.clientRoom;
    if (clientRoom == null) {
      clientRoom = new ClientRoom(roomnum, this.clientContext);
      this.clientContext.clientRoom = clientRoom;
    }

    this.clientContext.clientListener.createdRoomListener(clientRoom);
    return clientRoom;
  }

  private deleteRoom(roomnum: string): void {
    this.clientContext.clientRoom = undefined;

    this.clientContext.socket.emit(eventsServerSend.LEAVE_ROOM, {
      roomnum: roomnum,
    });

    this.clientContext.clientListener.deletedRoomListener(roomnum);
  }

  joinRoom(clientTab: ClientTab, roomnum: string): ClientRoom {
    const clientRoom = this.createRoom(roomnum);
    clientRoom.clientTab = clientTab;
    clientTab.setClientRoom(clientRoom);

    this.clientContext.clientListener.joinedRoomListener(clientTab, clientRoom);

    return clientRoom;
  }

  leaveRoom(clientTab: ClientTab) {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) return;

    const roomnum = clientRoom.roomnum;

    clientTab.setClientRoom(undefined);
    clientRoom.clientTab = undefined;

    this.clientContext.clientListener.leavedRoomListener(clientTab, clientRoom);

    if (clientRoom.clientTab == null) {
      this.deleteRoom(roomnum);
    }
  }

  restartSocket(clientTab: ClientTab, roomnum: string) {
    this.clientContext.socket.close();
    setTimeout(() => {
      this.clientContext.socket.connect();
      this.joinRoom(clientTab, roomnum);
    }, 100);
  }

  saveLog(...logs: any[]) {
    this.logs.push(
      "log: " +
        logs.map((log) => {
          return typeof log?.simplify === "function"
            ? JSON.stringify(log.simplify())
            : JSON.stringify(log);
        })
    );
    return logs;
  }

  saveError(...errors: any[]) {
    this.logs.push(
      "error: " +
        errors.map((error) => {
          return typeof error?.simplify === "function"
            ? JSON.stringify(error.simplify())
            : JSON.stringify(error);
        })
    );
    return errors;
  }

  getLogs() {
    return this.logs;
  }
}
