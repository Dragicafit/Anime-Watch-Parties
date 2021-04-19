const { ClientContext } = require("./clientContext");
const { ClientEvent } = require("./clientEvents");
const { ClientUtils } = require("./clientUtils");
const { ClientSync } = require("./clientSync");

module.exports = {
  /** @param {ClientContext} clientContext @param {ClientUtils} clientUtils @param {ClientEvent} clientEvent @param {ClientSync} clientSync */
  start: function (clientContext, clientUtils, clientEvent, clientSync) {
    clientContext.browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status !== "complete") return;
      if (!clientContext.clientTabs.has(tabId)) return;
      console.log("updated");
      clientUtils.insertScript(tabId);
    });
    clientContext.browser.tabs.onRemoved.addListener((tabId) => {
      if (!clientContext.clientTabs.has(tabId)) return;
      console.log("removed");
      clientContext.clientTabs.delete(tabId);
    });

    clientContext.browser.runtime.onMessage.addListener((message, sender) => {
      if (sender.tab == null) return clientUtils.getActiveTab().then(func);
      func(sender.tab);

      function func(tab) {
        if (tab == null) return;
        let tabId = tab.id;

        switch (message?.command) {
          case "askInfo":
            clientEvent.askInfo(tabId);
            break;
          case "insertScript":
            clientUtils.insertScript(tabId);
            break;
          case "joinRoom":
            clientEvent.joinRoom(tab, tabId, message.roomnum);
            break;
          case "scriptLoaded":
            clientEvent.scriptLoaded(tabId);
            break;
          case "sendState":
            clientEvent.sendState(tabId, message.time, message.state);
            break;
          case "restartSocket":
            clientEvent.restartSocket(tab, tabId, message.roomnum);
            break;
          case "syncClient":
            clientSync.syncClient(tabId);
            break;
          default:
            break;
        }
      }
    });

    clientContext.socket.on("changeStateClient", (data) =>
      clientEvent.changeStateClient(data.roomnum, data.time, data.state)
    );
    clientContext.socket.on("getUsers", (data) =>
      clientEvent.getUsers(data.roomnum, data.onlineUsers)
    );
    clientContext.socket.on("unSetHost", () =>
      clientEvent.unSetHost(data.roomnum)
    );
    clientContext.socket.on("changeVideoClient", (data) =>
      clientEvent.changeVideoClient(
        data.roomnum,
        data.site,
        data.location,
        data.videoId
      )
    );
  },
};
