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

    browser.tabs
      .sendMessage(tabId, {
        command: "sendInfo",
        roomnum: clientTab?.roomnum,
        host: clientTab?.host,
      })
      .catch(this.clientUtils.reportError);
  }

  scriptLoaded(tab: browser.tabs.Tab, tabId: number) {
    console.log("script loaded");

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
      this.changeVideoClient(data.roomnum, {
        site: data.site,
        location: data.location,
        videoId: data.videoId,
      });
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

    browser.tabs
      .sendMessage(tabId, {
        command: "changeStateClient",
        time: time,
        state: state,
      })
      .catch(this.clientUtils.reportError);
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
    url: {
      site: string;
      location: string;
      videoId: string;
    }
  ) {
    console.log("change video client");
    console.log("new url is", url);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;
      this.changeVideoClientTab(tabId, url);
    }
  }

  changeVideoClientTab(
    tabId: number,
    url: {
      site: string;
      location: string;
      videoId: string;
    }
  ) {
    console.log("change video client");
    console.log("new url is", url);

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.clientUtils.parseUrlTab(tab).then((oldUrl) => {
          console.log("old url is", oldUrl);
          if (oldUrl?.site === url.site && oldUrl?.videoId === url.videoId) {
            return;
          }

          let newUrl;
          switch (url.site) {
            case "wakanim":
              newUrl = `https://www.wakanim.tv/${url.location}/v2/catalogue/episode/${url.videoId}`;
              break;
            case "crunchyroll":
              if (url?.site === "crunchyroll" && oldUrl?.location != null) {
                newUrl = `https://www.crunchyroll.com/${oldUrl.location}/${url.videoId}`;
              } else {
                newUrl = `https://www.crunchyroll.com/${url.videoId}`;
              }
              break;
            case "funimation":
              newUrl = `https://www.funimation.com/${url.location}/shows/${url.videoId}`;
              break;
            case "newFunimation":
              newUrl = `https://www.funimation.com/v/${url.videoId}`;
              break;
            case "adn":
              newUrl = `https://animedigitalnetwork.fr/video/${url.videoId}`;
              break;
            default:
              return;
          }
          console.log("change video client to", newUrl);
          browser.tabs.update(tabId, {
            active: true,
            url: newUrl,
          });
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
