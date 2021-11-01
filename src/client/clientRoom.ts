import { ClientContext } from "./clientContext";
import { ClientTab } from "./clientTab";

export class ClientRoom {
  private clientContext: ClientContext;

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

  public constructor(roomnum: string, clientContext: ClientContext) {
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
}
