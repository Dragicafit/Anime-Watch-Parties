import { SupportedSite } from "./../server/io/ioConst";
import { IoCallback } from "../server/io/ioConst";
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
    console.log("change video server", url);
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
    console.log("change state server", { time: time, state: state });
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

  syncClient(clientTab: ClientTab): void {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    console.log("sync client");

    this.clientContext.socket.emit(
      "syncClient",
      {
        roomnum: clientRoom.roomnum,
      },
      <IoCallback>((err, data) => {
        if (err) {
          return console.log(err);
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
      })
    );
  }
}
