import { ClientContext } from "./clientContext";
import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export class ClientUtils {
  clientContext: ClientContext;

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
  }

  createTab(tabId: number): ClientTab {
    let clientTab = this.clientContext.clientTabs.get(tabId);
    if (clientTab == null) {
      clientTab = new ClientTab(tabId);
      this.clientContext.clientTabs.set(tabId, clientTab);
    }

    this.clientContext.clientListener.createdTabListener(clientTab);
    return clientTab;
  }

  deleteTab(tabId: number): void {
    const clientTab = this.clientContext.clientTabs.get(tabId);
    if (clientTab == null) return;

    this.leaveRoom(clientTab);

    this.clientContext.clientTabs.delete(tabId);

    this.clientContext.clientListener.deletedTabListener(tabId);
  }

  private createRoom(roomnum: string): ClientRoom {
    let clientRoom = this.clientContext.clientRooms.get(roomnum);
    if (clientRoom == null) {
      clientRoom = new ClientRoom(roomnum, this.clientContext);
      this.clientContext.clientRooms.set(roomnum, clientRoom);
    }

    this.clientContext.clientListener.createdRoomListener(clientRoom);
    return clientRoom;
  }

  private deleteRoom(roomnum: string): void {
    this.clientContext.clientRooms.delete(roomnum);

    this.clientContext.socket.emit("leaveRoom", {
      roomnum: roomnum,
    });

    this.clientContext.clientListener.deletedRoomListener(roomnum);
  }

  joinRoom(clientTab: ClientTab, roomnum: string): ClientRoom {
    const clientRoom = this.createRoom(roomnum);
    clientRoom.clientTabs.set(clientTab.getTabId(), clientTab);
    clientTab.setClientRoom(clientRoom);

    this.clientContext.clientListener.joinedRoomListener(clientTab, clientRoom);

    return clientRoom;
  }

  leaveRoom(clientTab: ClientTab) {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) return;

    const roomnum = clientRoom.roomnum;

    clientTab.setClientRoom(undefined);
    clientRoom.clientTabs.delete(clientTab.getTabId());

    this.clientContext.clientListener.leavedRoomListener(clientTab, clientRoom);

    if (clientRoom.clientTabs.size == 0) {
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

  reportError(error: any) {
    console.error("error:", error);
  }
}
