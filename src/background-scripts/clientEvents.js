const { ClientContext } = require("./clientContext");
const { ClientTab } = require("./clientTab");
const { ClientSync } = require("./clientSync");
const { ClientUtils } = require("./clientUtils");

class ClientEvent {
  /** @type {ClientContext} */
  clientContext;
  /** @type {ClientUtils} */
  clientUtils;
  /** @type {ClientSync} */
  clientSync;

  /** @param {ClientContext} clientContext @param {ClientUtils} clientUtils @param {ClientSync} clientSync */
  constructor(clientContext, clientUtils, clientSync) {
    this.clientContext = clientContext;
    this.clientUtils = clientUtils;
    this.clientSync = clientSync;
  }

  askInfo(tabId, clientTab = this.clientContext.clientTabs.get(tabId)) {
    console.log("ask info");

    this.clientContext.browser.runtime
      .sendMessage({
        command: "sendInfo",
        roomnum: clientTab?.roomnum,
        onlineUsers: clientTab?.onlineUsers,
      })
      .catch(this.clientUtils.reportError);

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "sendInfo",
      roomnum: clientTab?.roomnum,
      host: clientTab?.host,
    });
  }

  scriptLoaded(tabId) {
    console.log("script loaded");

    if (!this.clientContext.clientTabs.has(tabId))
      this.clientContext.clientTabs.set(
        tabId,
        new ClientTab(this.clientContext)
      );

    this.askInfo(tabId);
  }

  joinRoom(tab, tabId, roomnum) {
    console.log(`join room`);

    for (let [tabId2, clientTab2] of this.clientContext.clientTabs.entries()) {
      if (clientTab2?.roomnum !== roomnum) continue;

      if (clientTab2.host) {
        this.joinedRoom(
          null,
          { roomnum: roomnum, host: tabId2 == tabId },
          tab,
          tabId
        );
        return;
      }
    }

    this.clientContext.socket.emit(
      "joinRoom",
      { roomnum: roomnum },
      (err, data) => this.joinedRoom(err, data, tab, tabId)
    );
  }

  joinedRoom(err, data, tab, tabId) {
    if (err) {
      console.log(err);
      return;
    }

    if (!this.clientContext.clientTabs.has(tabId)) {
      this.clientContext.clientTabs.set(
        tabId,
        new ClientTab(this.clientContext)
      );
    }
    let clientTab = this.clientContext.clientTabs.get(tabId);
    clientTab.roomnum = data.roomnum;
    clientTab.host = data.host;

    if (data.videoId != null) {
      this.changeVideoClient(
        data.roomnum,
        data.site,
        data.location,
        data.videoId
      );
    }
    if (data.time != null && data.state != null) {
      this.changeStateClient(data.roomnum, data.time, data.state);
    }
    if (data.onlineUsers != null) {
      this.getUsers(data.roomnum, data.onlineUsers);
    }

    if (clientTab.host) {
      console.log("You are the new host!");
    } else {
      this.clientSync.startEmbed(tabId);
    }
    console.log(`send room number after joinRoom ${clientTab.roomnum}`);

    this.askInfo(tabId, clientTab);
  }

  leaveRoom(tabId) {
    console.log(`leave room`);

    let { roomnum, host: wasHost } = this.clientContext.clientTabs.get(tabId);
    this.clientContext.clientTabs.delete(tabId);

    if (wasHost) {
      for (let [
        tabId2,
        clientTab2,
      ] of this.clientContext.clientTabs.entries()) {
        if (clientTab2?.roomnum !== roomnum) continue;

        this.clientContext.browser.tabs
          .get(tabId2)
          .then((tab2) =>
            this.joinedRoom(
              null,
              { roomnum: roomnum, host: true },
              tab2,
              tabId2
            )
          );
        return;
      }
    }

    if (this.clientContext.clientTabs.size == 0) {
      this.clientContext.socket.emit("leaveRoom", { roomnum: roomnum });
    }
  }

  changeStateClient(roomnum, time, state) {
    console.log(`change state client`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      this.changeStateClientTab(tabId, time, state);
    }
  }

  changeStateClientTab(tabId, time, state) {
    console.log(`change state client`);

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "changeStateClient",
      time: time,
      state: state,
    });
  }

  sendState(tabId, time, state) {
    console.log(`send state`);
    this.clientSync.changeStateServer(tabId, time, state);
  }

  getUsers(roomnum, onlineUsers) {
    console.log(`get users: ${onlineUsers}`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      clientTab.onlineUsers = onlineUsers;

      this.askInfo(tabId, clientTab);
    }
  }

  unSetHost(roomnum) {
    console.log("Unsetting host");

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;

      clientTab.host = false;

      this.askInfo(tabId, clientTab);
    }
  }

  changeVideoClient(roomnum, site, location, videoId) {
    console.log("change video client");
    console.log(`video id is: ${videoId}`);

    for (let [tabId, clientTab] of this.clientContext.clientTabs.entries()) {
      if (clientTab?.roomnum !== roomnum) continue;
      this.changeVideoClientTab(tabId, site, location, videoId);
    }
  }

  changeVideoClientTab(tabId, site, location, videoId) {
    console.log("change video client");
    console.log(`video id is: ${videoId}`);

    this.clientContext.browser.tabs
      .get(tabId)
      .then((tab) => {
        let url = this.clientSync.parseUrl(tab.url);

        if (url.site === site && url.videoId === videoId) return;

        let newUrl;
        switch (site) {
          case "wakanim":
            newUrl = `https://www.wakanim.tv/${location}/v2/catalogue/episode/${videoId}`;
            break;
          case "crunchyroll":
            if (url.site === "crunchyroll" && url.location != null) {
              newUrl = `https://www.crunchyroll.com/${url.location}/${videoId}`;
            } else {
              newUrl = `https://www.crunchyroll.com/${videoId}`;
            }
            break;
          default:
            return;
        }
        this.clientContext.browser.tabs.update(tabId, {
          active: true,
          url: newUrl,
        });
      })
      .catch(this.clientUtils.reportError);
  }

  restartSocket(tab, tabId, roomnum) {
    this.clientContext.socket.close();
    setTimeout(() => {
      this.clientContext.socket.connect();
      this.joinRoom(tab, tabId, roomnum);
    }, 100);
  }
}

exports.ClientEvent = ClientEvent;
