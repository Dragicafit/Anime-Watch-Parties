import { SocketId } from "socket.io-adapter";
import { IoContext } from "./ioContext";

export class IoRoom {
  static ioContext: IoContext;

  roomnum: string;
  host: SocketId | undefined;
  state: boolean;
  currTime: number;
  lastChange: number;
  currVideo: string | undefined;
  site: string | undefined;
  location: string | undefined;

  constructor(roomnum: string) {
    this.roomnum = roomnum;
    this.state = false;
    this.currTime = 0;
    this.lastChange = 0;

    this.updateState(false, 0);
  }

  updateState(state: boolean, currTime: number) {
    this.state = state;
    this.currTime = currTime;
    this.lastChange = IoRoom.ioContext.performance.now();
  }

  updateVideo(currVideo: string, site: string, location: string | undefined) {
    this.currVideo = currVideo;
    this.site = site;
    this.location = location;
    this.updateState(false, 0);
  }

  isStateDefined() {
    return (
      this.currTime != null && this.state != null && this.lastChange != null
    );
  }

  isVideoDefined() {
    return this.currVideo != null;
  }

  get stateObject() {
    let currTime = this.currTime;
    if (this.state) {
      currTime += (IoRoom.ioContext.performance.now() - this.lastChange) / 1000;
    }
    return {
      roomnum: this.roomnum,
      state: this.state,
      time: currTime,
    };
  }

  get videoObject() {
    return {
      roomnum: this.roomnum,
      videoId: this.currVideo,
      site: this.site,
      location: this.location,
    };
  }
}

export class Room extends Set {
  ioRoom: IoRoom | undefined;
}
