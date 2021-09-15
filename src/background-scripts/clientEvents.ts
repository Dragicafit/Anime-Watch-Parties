import { IoCallback } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientSync } from "./clientSync";
import { ClientUtils } from "./clientUtils";

export class ClientEvent {
  clientContext: ClientContext;
  clientUtils: ClientUtils;
  clientSync: ClientSync;

  constructor(
    clientContext: ClientContext,
    clientUtils: ClientUtils,
    clientSync: ClientSync
  ) {
    this.clientContext = clientContext;
    this.clientUtils = clientUtils;
    this.clientSync = clientSync;
  }

  askInfo(tabId: number, clientTab = this.clientContext.clientTabs.get(tabId)) {
    console.log("ask info");

    browser.runtime
      .sendMessage({
        command: "sendInfo",
        roomnum: clientTab?.roomnum,
        onlineUsers: clientTab?.onlineUsers,
      })
      .catch(this.clientUtils.reportError);

    browser.tabs.sendMessage(tabId, {
      command: "sendInfo",
      roomnum: clientTab?.roomnum,
      host: clientTab?.host,
    });
  }

  scriptLoaded(tab: browser.tabs.Tab, tabId: number) {
    console.log("script loaded");

    this.clientUtils.joinTab(tab, tabId);
    this.askInfo(tabId);
  }

  createRoom(tab: browser.tabs.Tab, tabId: number) {
    console.log(`create from tab ${tabId}`);

    this.clientContext.socket.emit("createRoom", <IoCallback>(
      ((err, data) => this.joinedRoom(err, data, tab, tabId))
    ));
  }

  joinRoom(tab: browser.tabs.Tab, tabId: number, roomnum: string) {
    console.log(`join room ${roomnum} from tab ${tabId}`);

    // for (let [tabId2, clientTab2] of this.clientContext.clientTabs.entries()) {
    //   if (clientTab2?.roomnum !== roomnum) continue;
    //   if (tabId2 === tabId) continue;

    //   if (clientTab2.host) {
    //     this.joinedRoom(null, { roomnum: roomnum, host: false }, tab, tabId);
    //     return;
    //   }
    // }

    this.clientContext.socket.emit("joinRoom", { roomnum: roomnum }, <
      IoCallback
    >((err, data) => this.joinedRoom(err, data, tab, tabId)));
  }

  joinedRoom(
    err: string | null,
    data: any,
    tab: browser.tabs.Tab,
    tabId: number
  ) {
    if (err) {
      console.log(err);
      return;
    }

    let oldClientTab = this.clientContext.clientTabs.get(tabId);
    if (oldClientTab != null && oldClientTab.roomnum !== data.roomnum) {
      this.leaveRoom(tabId);
    }
    this.clientUtils.joinTab(tab, tabId);
    let clientTab = this.clientContext.clientTabs.get(tabId)!;
    clientTab.roomnum = data.roomnum;
    clientTab.host = data.host;

    if (data.videoId != null) {
      this.changeVideoClient(
        data.roomnum,
        data.site,
        data.location,
        data.videoId
      );
    } else if (data.host) {
      this.clientSync.changeVideoServer(tab);
    }
    if (data.time != null && data.state != null) {
      this.changeStateClient(data.roomnum, data.time, data.state);
    } else if (data.host) {
      this.clientSync.askState(tabId);
    }
    if (data.onlineUsers != null) {
      this.getUsers(data.roomnum, data.onlineUsers);
    }

    if (clientTab.host) {
      console.log("You are the new host!");
    } else {
      //this.clientSync.startEmbed(tabId);
    }
    console.log(`send room number after joinRoom ${clientTab.roomnum}`);

    this.askInfo(tabId, clientTab);
  }

  leaveRoom(tabId: number) {
    console.log(`leave room`);

    let { roomnum } = this.clientContext.clientTabs.get(tabId)!;
    this.clientContext.clientTabs.delete(tabId);

    if (
      Array.from(
        this.clientContext.clientTabs,
        ([key, value]) => value.roomnum
      ).filter((roomnum2) => roomnum2 === roomnum).length == 0
    ) {
      this.clientContext.socket.emit("leaveRoom", { roomnum: roomnum });
    }
  }

  changeStateClient(roomnum: string, time: number, state: boolean) {
    console.log(`change state client`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      this.changeStateClientTab(tabId, time, state);
    }
  }

  changeStateClientTab(tabId: number, time: number, state: boolean) {
    console.log(`change state client`);

    browser.tabs.sendMessage(tabId, {
      command: "changeStateClient",
      time: time,
      state: state,
    });
  }

  sendState(tabId: number, time: number, state: boolean) {
    console.log(`send state`);
    this.clientSync.changeStateServer(tabId, time, state);
  }

  getUsers(roomnum: string, onlineUsers: number) {
    console.log(`get users: ${onlineUsers}`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      clientTab.onlineUsers = onlineUsers;

      this.askInfo(tabId, clientTab);
    }
  }

  unSetHost(roomnum: string) {
    console.log("Unsetting host");

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      clientTab.host = false;

      this.askInfo(tabId, clientTab);
    }
  }

  changeVideoClient(
    roomnum: string,
    site: string,
    location: string,
    videoId: string
  ) {
    console.log("change video client");
    console.log(`video id is: ${videoId}`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;
      this.changeVideoClientTab(tabId, site, location, videoId);
    }
  }

  changeVideoClientTab(
    tabId: number,
    site: string,
    location: string,
    videoId: string
  ) {
    console.log("change video client");
    console.log(`video id is: ${videoId}`);

    browser.tabs
      .get(tabId)
      .then((tab) => {
        let url = this.clientUtils.parseUrl(tab.url!);

        if (url?.site === site && url?.videoId === videoId) return;

        let newUrl;
        switch (site) {
          case "wakanim":
            newUrl = `https://www.wakanim.tv/${location}/v2/catalogue/episode/${videoId}`;
            break;
          case "crunchyroll":
            if (url?.site === "crunchyroll" && url?.location != null) {
              newUrl = `https://www.crunchyroll.com/${url.location}/${videoId}`;
            } else {
              newUrl = `https://www.crunchyroll.com/${videoId}`;
            }
            break;
          case "funimation":
            newUrl = `https://www.funimation.com/${location}/shows/${videoId}`;
            break;
          default:
            return;
        }
        browser.tabs.update(tabId, {
          active: true,
          url: newUrl,
        });
      })
      .catch(this.clientUtils.reportError);
  }

  restartSocket(tab: browser.tabs.Tab, tabId: number, roomnum: string) {
    this.clientContext.socket.close();
    setTimeout(() => {
      this.clientContext.socket.connect();
      this.joinRoom(tab, tabId, roomnum);
    }, 100);
  }
}
