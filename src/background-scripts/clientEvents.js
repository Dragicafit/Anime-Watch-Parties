const { ClientContext } = require("./clientContext");
const { ClientRoom } = require("./clientRoom");
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

  askInfo(tabId) {
    console.log("ask info");

    this.clientContext.browser.runtime
      .sendMessage({
        command: "sendInfo",
        roomnum: this.clientContext.infoTabs.get(tabId)?.roomnum,
        onlineUsers: this.clientContext.infoTabs.get(tabId)?.onlineUsers,
      })
      .catch(this.clientUtils.reportError);

    if (this.clientContext.infoTabs.get(tabId) == null) return;

    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "sendInfo",
      roomnum: this.clientContext.infoTabs.get(tabId).roomnum,
      host: this.clientContext.infoTabs.get(tabId).host,
    });
  }

  scriptLoaded(tabId) {
    console.log("script loaded");

    if (this.clientContext.infoTabs.get(tabId) == null)
      return this.clientContext.infoTabs.set(tabId, new ClientRoom());

    this.askInfo(tabId);
  }

  joinRoom(tab, tabId, roomnum) {
    console.log(`join room`);

    this.clientContext.socket.emit(
      "joinRoom",
      { roomnum: roomnum },
      (err, data) => {
        if (err) {
          console.log(err);
          if (err === "not connected") {
            this.clientSync.openPopupTwitch(tabId, roomnum);
          }
          return;
        }

        if (this.clientContext.infoTabs.get(tabId) == null)
          this.clientContext.infoTabs.set(tabId, new ClientRoom());
        this.clientContext.infoTabs.get(tabId).roomnum = data.roomnum;
        this.clientContext.infoTabs.get(tabId).host = data.host;

        if (data.host) {
          console.log("You are the new host!");
          this.clientSync.changeVideoServer(tab);
          this.clientSync.askState(tabId);
        } else {
          this.clientSync.startEmbed(tabId);
        }
        console.log(`send room number after joinRoom ${data.roomnum}`);

        this.askInfo(tabId);
      }
    );
  }

  changeStateClient(time, state) {
    console.log(`change state client`);
    //
    if (this.clientContext.infoTabs.size == 0) return;
    let tabId = this.clientContext.infoTabs.keys().next().value;
    //
    this.clientContext.browser.tabs.sendMessage(tabId, {
      command: "changeStateClient",
      time: time,
      state: state,
    });
  }

  sendState(time, state) {
    console.log(`send state`);
    this.clientSync.changeStateServer(time, state);
  }

  getUsers(newOnlineUsers) {
    console.log(`get users: ${newOnlineUsers}`);

    //
    if (this.clientContext.infoTabs.size == 0) return;
    let tabId = this.clientContext.infoTabs.keys().next().value;
    //

    if (this.clientContext.infoTabs.get(tabId) == null) return;

    this.clientContext.infoTabs.get(tabId).onlineUsers = newOnlineUsers;

    this.askInfo(tabId);
  }

  unSetHost() {
    console.log("Unsetting host");

    //
    if (this.clientContext.infoTabs.size == 0) return;
    let tabId = this.clientContext.infoTabs.keys().next().value;
    //
    if (this.clientContext.infoTabs.get(tabId) == null) return;

    this.clientContext.infoTabs.get(tabId).host = false;

    this.askInfo(tabId);
  }

  changeVideoClient(site, location, videoId) {
    console.log("change video client");
    console.log(`video id is: ${videoId}`);

    //
    if (this.clientContext.infoTabs.size == 0) return;
    let tabId = this.clientContext.infoTabs.keys().next().value;
    //

    if (this.clientContext.infoTabs.get(tabId) == null) return;

    this.clientContext.browser.tabs
      .get(tabId)
      .then((tab) => {
        let url = this.clientSync.parseUrl(tab.url);

        if (
          url.site === site &&
          url.location === location &&
          url.videoId === videoId
        )
          return;

        let newUrl;
        switch (site) {
          case "wakanim":
            newUrl = `https://www.wakanim.tv/${location}/v2/catalogue/episode/${videoId}`;
            break;
          case "crunchyroll":
            newUrl = `https://www.crunchyroll.com/${location}/${videoId}`;
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

  restartSocket(tabId, roomnum) {
    this.clientContext.socket.close();
    setTimeout(() => {
      this.clientContext.socket.connect();
      this.joinRoom(tabId, roomnum);
    }, 100);
  }
}

exports.ClientEvent = ClientEvent;
