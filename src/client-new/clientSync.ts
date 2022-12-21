import {
  eventsServerReceive,
  IoCallback,
  SupportedSite,
} from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";
import { ClientTab } from "./clientTab";
import { ClientUtils } from "./clientUtils";

export class ClientSync {
  clientContext: ClientContext;
  clientUtils: ClientUtils;
  clientEvent: ClientEvent | undefined;

  constructor(clientContext: ClientContext, clientUtils: ClientUtils) {
    this.clientContext = clientContext;
    this.clientUtils = clientUtils;
  }

  changeVideoServer(
    clientTab: ClientTab,
    url: {
      videoId: string;
      site: SupportedSite;
      location?: string;
    }
  ): void {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    console.log(...this.saveLog("change video server", clientTab, url));

    clientRoom.updateVideo(url);
    this.clientUtils.emit(eventsServerReceive.CHANGE_VIDEO_SERVER, {
      roomnum: clientRoom.roomnum,
      site: url.site,
      location: url.location,
      videoId: url.videoId,
    });
  }

  changeStateServer(clientTab: ClientTab, time: number, state: boolean): void {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    console.log(
      ...this.saveLog("change state server", clientTab, {
        time: time,
        state: state,
      })
    );

    clientRoom.updateState(state, time);
    this.clientUtils.emit(eventsServerReceive.CHANGE_STATE_SERVER, {
      roomnum: clientRoom.roomnum,
      time: time,
      state: state,
    });
  }

  changeNameServer(name: string): void {
    console.log(
      ...this.saveLog("change name server", {
        name: name,
      })
    );

    this.clientUtils.emit(
      eventsServerReceive.CHANGE_NAME,
      {
        name: name,
      },
      (error: any) => {
        if (error) {
          return;
        }
        this.clientContext.clientListener.changeNameClientListener(name);
      }
    );
  }

  createMessageServer(clientTab: ClientTab, message: string): void {
    if (this.clientContext.name == null) {
      return;
    }
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    console.log(
      ...this.saveLog("create message server", clientTab, {
        time: message,
      })
    );

    this.clientUtils.emit(eventsServerReceive.CREATE_MESSAGE_SERVER, {
      roomnum: clientRoom.roomnum,
      message: message,
    });
  }

  syncClient(clientTab: ClientTab): void {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    console.log(...this.saveLog("sync client", clientTab));

    this.clientUtils.emit(
      eventsServerReceive.SYNC_CLIENT,
      {
        roomnum: clientRoom.roomnum,
      },
      <IoCallback>((err, data) => {
        if (err) {
          return console.log(...this.saveLog(err));
        }
        if (data == null) return;

        if (data.videoId != null && data.site != null) {
          this.clientEvent!.changeVideoClient(clientRoom, {
            site: data.site,
            location: data.location,
            videoId: data.videoId,
          });
        }
        if (data.time != null && data.state != null) {
          this.clientEvent!.changeStateClient(
            clientRoom,
            data.time,
            data.state
          );
        }
        if (data.messages != null) {
          this.clientEvent!.changeMessagesClient(clientRoom, data.messages);
        }
      })
    );
  }

  askInfo(clientTab: ClientTab): void {
    this.clientUtils.emit(eventsServerReceive.ASK_INFO, <IoCallback>((
      err,
      data
    ) => {
      if (err) {
        return console.log(...this.saveLog(err));
      }
      if (data == null) return;

      if (data.name) {
        this.clientEvent?.changeNameClient(data.name);
      }
      if (data.roomnum) {
        this.clientEvent?.joinRoom(clientTab, data.roomnum);
      }
    }));
  }

  reportBug() {
    console.log(...this.saveLog("report a bug"));

    this.clientUtils.emit(eventsServerReceive.REPORT_BUG, {
      logs: this.clientUtils.getLogs(),
    });
  }

  private saveLog(...logs: any[]) {
    return this.clientUtils.saveLog(...logs);
  }
}
