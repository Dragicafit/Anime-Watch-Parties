import { SupportedSite } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientTab } from "./clientTab";

export class ClientRoom {
  private clientContext: ClientContext;

  roomnum: string;
  host: boolean;
  onlineUsers: number;
  private state: boolean;
  private currTime: number;
  private lastChange: number;
  private url:
    | {
        videoId: string;
        site: SupportedSite;
        location?: string;
      }
    | undefined;
  messages: { sender: string; message: string }[];

  public constructor(roomnum: string, clientContext: ClientContext) {
    this.clientContext = clientContext;

    this.roomnum = roomnum;
    this.host = false;
    this.onlineUsers = 0;
    this.state = false;
    this.currTime = 0;
    this.lastChange = 0;
    this.messages = [];

    this.updateState(false, 0);
  }

  public updateState(state: boolean, currTime: number) {
    this.state = state;
    this.currTime = currTime;
    this.lastChange = this.clientContext.performance.now();
  }

  public updateVideo(url: {
    videoId: string;
    site: SupportedSite;
    location?: string;
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

  public getClientTab(): ClientTab {
    return this.clientContext.clientTab;
  }
}
