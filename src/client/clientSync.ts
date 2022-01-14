import { IoCallback } from "../server/io/ioConst";
import { SupportedSite } from "./../server/io/ioConst";
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
    const tabId = clientTab.getTabId();

    clientRoom.updateVideo(url);
    this.clientContext.socket.emit("changeVideoServer", {
      roomnum: clientRoom.roomnum,
      site: url.site,
      location: url.location,
      videoId: url.videoId,
    });
    for (const [tabId2, clientTab2] of clientRoom.clientTabs) {
      if (tabId2 === tabId) continue;
      this.clientContext.clientListener.changeVideoClientTabListener(
        clientTab2
      );
    }
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
    const tabId = clientTab.getTabId();

    clientRoom.updateState(state, time);
    this.clientContext.socket.emit("changeStateServer", {
      roomnum: clientRoom.roomnum,
      time: time,
      state: state,
    });
    for (const [tabId2, clientTab2] of clientRoom.clientTabs) {
      if (tabId2 === tabId) continue;
      this.clientContext.clientListener.changeStateClientTabListener(
        clientTab2
      );
    }
  }

  changeNameServer(clientTab: ClientTab, name: string): void {
    console.log(
      ...this.saveLog("change name server", clientTab, {
        name: name,
      })
    );

    this.clientContext.socket.emit(
      "changeName",
      {
        name: name,
      },
      (error: any) => {
        if (error) {
          return;
        }
        this.clientContext.name = name;

        const clientRoom = clientTab.getClientRoom();
        if (clientRoom == null) {
          return;
        }

        for (const [, clientTab2] of clientRoom.clientTabs) {
          this.clientContext.clientListener.changeNameClientTabListener(
            clientTab2
          );
        }
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

    this.clientContext.socket.emit("createMessageServer", {
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

    this.clientContext.socket.emit(
      "syncClient",
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

  reportBug() {
    console.log(...this.saveLog("report a bug"));

    this.clientContext.socket.emit("reportBug", {
      logs: this.clientUtils.getLogs(),
    });
  }

  private saveLog(...logs: any[]) {
    return this.clientUtils.saveLog(...logs);
  }
}
