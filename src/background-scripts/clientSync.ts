const { ClientContext } = require("./clientContext");
const { parseUrlWakanim, parseUrlCrunchyroll } = require("./clientConst");
const { ClientEvent } = require("./clientEvents");

class ClientSync {
  /** @type {ClientContext} */
  clientContext;
  /** @type {ClientEvent} */
  clientEvent;

  /** @param {ClientContext} clientContext */
  constructor(clientContext) {
    this.clientContext = clientContext;
  }

  parseUrl(url) {
    console.log("parse url");

    let pathname = url.match(parseUrlWakanim);
    if (pathname != null) {
      return {
        videoId: pathname.groups.videoId,
        site: "wakanim",
        location: pathname.groups.location,
      };
    }
    pathname = url.match(parseUrlCrunchyroll);
    if (pathname != null) {
      return {
        videoId: pathname.groups.videoId,
        site: "crunchyroll",
        location: pathname.groups.location,
      };
    }
    return {};
  }

  askState(tabId) {
    console.log("ask state");

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "askState",
    });
  }

  startEmbed(tabId) {
    console.log("start embed");

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "startEmbed",
    });
  }

  changeVideoServer(
    tab,
    clientTab = this.clientContext.clientTabs.get(tab.id)
  ) {
    console.log("change video server");

    let url = this.parseUrl(tab.url);
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
      this.clientEvent.changeVideoClientTab(
        tabId2,
        url.site,
        url.location,
        url.videoId
      );
    }
  }

  changeStateServer(
    tabId,
    currTime,
    state,
    clientTab = this.clientContext.clientTabs.get(tabId)
  ) {
    console.log("change state server");

    this.clientContext.socket.emit("changeStateServer", {
      roomnum: clientTab.roomnum,
      time: currTime,
      state: state,
    });
    for (let [tabId2, clientRoom2] of this.clientContext.clientTabs.entries()) {
      if (clientRoom2?.roomnum !== clientTab.roomnum || tabId2 === tabId)
        continue;
      this.clientEvent.changeStateClientTab(tabId2, currTime, state);
    }
  }

  syncClient(tabId, clientTab = this.clientContext.clientTabs.get(tabId)) {
    console.log("sync client");

    this.clientContext.socket.emit(
      "syncClient",
      {
        roomnum: clientTab.roomnum,
      },
      (err, data) => {
        if (err) {
          return console.log(err);
        }
        if (data.videoId != null) {
          this.clientEvent.changeVideoClient(
            data.roomnum,
            data.site,
            data.location,
            data.videoId
          );
        }
        if (data.time != null && data.state != null) {
          this.clientEvent.changeStateClient(
            data.roomnum,
            data.time,
            data.state
          );
        }
      }
    );
  }

  openPopupTwitch(tabId, roomnum) {
    console.log("open popup twitch");

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "openPopupTwitch",
      roomnum: roomnum,
    });
  }
}

exports.ClientSync = ClientSync;
