import { ClientRoom } from "./clientRoom";

export class ClientTab {
  private clientRoom: ClientRoom | undefined;

  constructor() {}

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
}
