import { ClientSimpleContext } from "./clientContext";
import { ClientTab, ClientTabSimplier } from "./clientTab";

export class ClientRoom {
  private clientContext: ClientSimpleContext;

  onlineUsers: number | undefined;
  clientTabs: Map<number, ClientTab>;
  roomnum: string;
  host: boolean | undefined;
  private state: boolean;
  private currTime: number;
  private lastChange: number;
  private url:
    | {
        videoId: string;
        site: string;
        location: string | undefined;
      }
    | undefined;

  public constructor(roomnum: string, clientContext: ClientSimpleContext) {
    this.clientContext = clientContext;
    this.roomnum = roomnum;
    this.state = false;
    this.currTime = 0;
    this.lastChange = 0;
    this.clientTabs = new Map();

    this.updateState(false, 0);
  }

  public updateState(state: boolean, currTime: number) {
    this.state = state;
    this.currTime = currTime;
    this.lastChange = this.clientContext.performance.now();
  }

  public updateVideo(url: {
    videoId: string;
    site: string;
    location: string | undefined;
  }) {
    this.url = url;
    this.updateState(false, 0);
  }

  public getCurrTime() {
    let currTime = this.currTime;
    if (this.state) {
      currTime +=
        (this.clientContext.performance.now() - this.lastChange) / 1000;
    }
    return currTime;
  }

  public getUrl() {
    return this.url;
  }

  public getState() {
    return this.state;
  }

  public simplify(): ClientRoomSimplier {
    return {
      onlineUsers: this.onlineUsers,
      clientTabs: new Map(
        [...this.clientTabs].map(([number, clientTab]) => [
          number,
          clientTab.simplify(),
        ])
      ),
      roomnum: this.roomnum,
      host: this.host,
      state: this.state,
      currTime: this.currTime,
      lastChange: this.lastChange,
      url: this.url,
    };
  }

  public static complexify(
    clientRoomSimplier: ClientRoomSimplier,
    clientContext: ClientSimpleContext
  ) {
    const clientRoom = new ClientRoom(
      clientRoomSimplier.roomnum,
      clientContext
    );
    clientRoom.onlineUsers = clientRoomSimplier.onlineUsers;
    clientRoom.clientTabs = new Map(
      [...clientRoomSimplier.clientTabs].map(([tabId, clientTab]) => [
        tabId,
        ClientTab.complexify(clientTab, clientRoom),
      ])
    );
    clientRoom.host = clientRoomSimplier.host;
    clientRoom.state = clientRoomSimplier.state;
    clientRoom.currTime = clientRoomSimplier.currTime;
    clientRoom.lastChange = clientRoomSimplier.lastChange;
    clientRoom.url = clientRoomSimplier.url;
    return clientRoom;
  }
}

export interface ClientRoomSimplier {
  onlineUsers: number | undefined;
  clientTabs: Map<number, ClientTabSimplier>;
  roomnum: string;
  host: boolean | undefined;
  state: boolean;
  currTime: number;
  lastChange: number;
  url:
    | {
        videoId: string;
        site: string;
        location: string | undefined;
      }
    | undefined;
}
