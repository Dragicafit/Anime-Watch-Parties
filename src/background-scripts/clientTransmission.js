const { ClientContext } = require("./clientContext");
const { ClientEvent } = require("./clientEvents");
const { ClientUtils } = require("./clientUtils");
const { ClientSync } = require("./clientSync");

module.exports = {
  /** @param {ClientContext} clientContext @param {ClientUtils} clientUtils @param {ClientEvent} clientEvent @param {ClientSync} clientSync */
  start: function (clientContext, clientUtils, clientEvent, clientSync) {
    clientContext.browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status !== "complete") return;
      if (clientContext.infoTabs.get(tabId) == null) return;
      console.log("updated");
      clientUtils.insertScript(tabId);
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
            clientEvent.sendState(message.time, message.state);
            break;
          case "restartSocket":
            clientEvent.restartSocket(tabId, message.roomnum);
            break;
          case "syncClient":
            clientSync.syncClient();
            break;
          default:
            break;
        }
      }
    });

    clientContext.socket.on("changeStateClient", (data) =>
      clientEvent.changeStateClient(data?.time, data?.state)
    );
    clientContext.socket.on("getUsers", (data) =>
      clientEvent.getUsers(data?.onlineUsers)
    );
    clientContext.socket.on("unSetHost", () => clientEvent.unSetHost());
    clientContext.socket.on("changeVideoClient", (data) =>
      clientEvent.changeVideoClient(data?.site, data?.location, data?.videoId)
    );
  },
};
