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

  askState(tabId: number) {
    console.log("ask state");

    browser.tabs.sendMessage(tabId, {
      command: "askState",
    });
  }

  changeVideoServer(
    tab: browser.tabs.Tab,
    clientTab: ClientTab = this.clientContext.clientTabs.get(tab.id!)!
  ): void {
    let url = tab.url == null ? null : this.clientUtils.parseUrl(tab.url);
    if (url == null) {
      return;
    }
    console.log(`change video to ${url.videoId}`);

    this.clientContext.socket.emit("changeVideoServer", {
      roomnum: clientTab.roomnum,
      site: url.site,
      location: url.location,
      videoId: url.videoId,
    });
    for (let [tabId2, clientRoom2] of this.clientContext.clientTabs.entries()) {
      if (clientRoom2?.roomnum !== clientTab.roomnum || tabId2 === tab.id)
        continue;
      this.clientEvent!.changeVideoClientTab(
        tabId2,
        url.site!,
        url.location!,
        url.videoId!
      );
    }
  }

  changeStateServer(
    tabId: number,
    currTime: number,
    state: boolean,
    clientTab: ClientTab = this.clientContext.clientTabs.get(tabId)!
  ): void {
    console.log("change state server");

    this.clientContext.socket.emit("changeStateServer", {
      roomnum: clientTab.roomnum,
      time: currTime,
      state: state,
    });
    for (let [tabId2, clientRoom2] of this.clientContext.clientTabs.entries()) {
      if (clientRoom2?.roomnum !== clientTab.roomnum || tabId2 === tabId)
        continue;
      this.clientEvent!.changeStateClientTab(tabId2, currTime, state);
    }
  }

  syncClient(
    tabId: number,
    clientTab: ClientTab = this.clientContext.clientTabs.get(tabId)!
  ): void {
    console.log("sync client");

    this.clientContext.socket.emit(
      "syncClient",
      {
        roomnum: clientTab.roomnum,
      },
      <IoCallback>((err, data) => {
        if (err) {
          return console.log(err);
        }
        if (data.videoId != null) {
          this.clientEvent!.changeVideoClient(
            data.roomnum,
            data.site,
            data.location,
            data.videoId
          );
        }
        if (data.time != null && data.state != null) {
          this.clientEvent!.changeStateClient(
            data.roomnum,
            data.time,
            data.state
          );
        }
      })
    );
  }
}
