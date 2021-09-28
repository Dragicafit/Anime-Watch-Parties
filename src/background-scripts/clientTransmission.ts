import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";
import { ClientSync } from "./clientSync";
import { ClientUtils } from "./clientUtils";

export default {
  start: function (
    clientContext: ClientContext,
    clientUtils: ClientUtils,
    clientEvent: ClientEvent,
    clientSync: ClientSync
  ) {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.url != null) {
        const url = new URL(tab.url);
        if (url.host == "awp.moe") {
          if (changeInfo.url != null) {
            const roomnum = url.pathname.match(/^\/(?<roomnum>[a-zA-Z0-9]{5})$/)
              ?.groups!["roomnum"];
            if (roomnum == null) {
              console.log("invalid roomnum", url.pathname.substring(1));
              return;
            }
            clientEvent.joinRoom(tab, tabId, roomnum);
          }
          return;
        }
      }

      if (!clientContext.clientTabs.has(tabId)) return;

      if (changeInfo.url != null) {
        console.log("updated: change url", tabId, changeInfo, tab);
        if (clientContext.clientTabs.get(tabId)?.host) {
          clientSync.changeVideoServer(tab);
        } else {
          clientSync.syncClient(tabId);
        }
      }

      if (changeInfo.status === "complete") {
        console.log("updated: complete", tabId, changeInfo, tab);
        for (let i = 0; i < 10; i++) {
          setTimeout(() => clientUtils.insertScript(tab, tabId), i * 1000);
        }
      }
    });
    browser.tabs.onRemoved.addListener((tabId) => {
      if (!clientContext.clientTabs.has(tabId)) return;
      console.log("removed");

      clientEvent.leaveRoom(tabId);
    });
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      clientUtils.changeIcon(tabId, tab);
    });

    browser.runtime.onMessage.addListener((message, sender) => {
      if (sender.tab == null) return clientUtils.getActiveTab().then(func);
      func(sender.tab);

      function func(tab: browser.tabs.Tab) {
        if (tab == null) return;
        let tabId = tab.id!;

        switch (message?.command) {
          case "askInfo":
            clientEvent.askInfo(tabId);
            break;
          case "joinTab":
            clientUtils.joinTab(tab, tabId);
            break;
          case "createRoom":
            clientEvent.createRoom(tab, tabId);
            break;
          case "joinRoom":
            clientEvent.joinRoom(tab, tabId, message.roomnum);
            break;
          case "scriptLoaded":
            clientEvent.scriptLoaded(tab, tabId);
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
    clientContext.socket.on("unSetHost", (data) =>
      clientEvent.unSetHost(data.roomnum)
    );
    clientContext.socket.on("changeVideoClient", (data) =>
      clientEvent.changeVideoClient(data.roomnum, {
        site: data.site,
        location: data.location,
        videoId: data.videoId,
      })
    );
  },
};
