const { ClientContext } = require("./clientContext");
const { parseUrlWakanim, parseUrlCrunchyroll } = require("./clientConst");

class ClientSync {
  /** @type {ClientContext} */
  clientContext;

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

  changeVideoServer(tab) {
    console.log("change video server");

    let url = this.parseUrl(tab.url);
    console.log(`change video to ${url.videoId}`);

    this.clientContext.socket.emit("changeVideoServer", {
      room: this.clientContext.infoTabs.get(tab.id).roomnum,
      videoId: url.videoId,
      site: url.site,
      location: url.location,
    });
  }

  changeStateServer(currTime, state) {
    console.log("change state server");

    this.clientContext.socket.emit("changeStateServer", {
      time: currTime,
      state: state,
    });
  }

  syncClient() {
    console.log("sync client");

    this.clientContext.socket.emit("syncClient");
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
