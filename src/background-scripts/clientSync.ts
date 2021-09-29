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

    browser.tabs
      .sendMessage(tabId, {
        command: "askState",
      })
      .catch(this.clientUtils.reportError);
  }

  changeVideoServer(
    tab: browser.tabs.Tab,
    clientTab: ClientTab = this.clientContext.clientTabs.get(tab.id!)!
  ): void {
    this.clientUtils.parseUrlTab(tab).then((url) => {
      if (url == null || url.site === "awp") {
        return;
      }
      console.log("change url to", url);

      this.clientContext.socket.emit("changeVideoServer", {
        roomnum: clientTab.roomnum,
        site: url.site,
        location: url.location,
        videoId: url.videoId,
      });
      for (const [
        tabId2,
        clientRoom2,
      ] of this.clientContext.clientTabs.entries()) {
        if (clientRoom2?.roomnum !== clientTab.roomnum || tabId2 === tab.id)
          continue;
        this.clientEvent!.changeVideoClientTab(tabId2, {
          site: url.site,
          location: url.location,
          videoId: url.videoId,
        });
      }
    });
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
          this.clientEvent!.changeVideoClient(data.roomnum, {
            site: data.site,
            location: data.location,
            videoId: data.videoId,
          });
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
