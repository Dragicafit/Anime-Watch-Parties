import { ClientRoom } from "./clientRoom";

export class ClientTab {
  private tabId: number;
  private clientRoom: ClientRoom | undefined;

  constructor(tabId: number) {
    this.tabId = tabId;
  }

  public getClientRoom(): ClientRoom | undefined {
    return this.clientRoom;
  }

  public setClientRoom(value: ClientRoom | undefined) {
    this.clientRoom = value;
  }

  public getOnlineUsers() {
    return this.clientRoom?.onlineUsers;
  }

  public setOnlineUsers(val: number) {
    if (this.clientRoom == null) {
      return;
    }
    this.clientRoom.onlineUsers = val;
  }

  public getHost() {
    return this.clientRoom?.host;
  }

  public setHost(val: boolean) {
    if (this.clientRoom == null) {
      return;
    }
    this.clientRoom.host = val;
  }

  public getRoomnum() {
    return this.clientRoom?.roomnum;
  }

  public setRoomnum(val: string) {
    if (this.clientRoom == null) {
      return;
    }
    this.clientRoom.roomnum = val;
  }

  public getTabId(): number {
    return this.tabId;
  }

  public setTabId(value: number) {
    this.tabId = value;
  }

  public simplify(): ClientTabSimplier {
    return { tabId: this.tabId };
  }

  public static complexify(
    clientTabSimplier: ClientTabSimplier,
    clientRoom?: ClientRoom
  ) {
    const clientTab = new ClientTab(clientTabSimplier.tabId);
    clientTab.clientRoom = clientRoom;
    return clientTab;
  }
}

export interface ClientTabSimplier {
  tabId: number;
}
