import browser from "webextension-polyfill";
import { ClientScript } from "../client/clientScript";
import {
  eventsBackgroundReceive,
  parseUrlAwp,
  SERVER_JOIN_URL,
} from "./backgroundConst";
import { BackgroundScript } from "./backgroundScript";

export default {
  start: function (
    clientScript: ClientScript,
    backgroundScript: BackgroundScript
  ) {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      const clientTab = clientScript.clientUtils.createTab(tabId);

      if (tab.url != null && changeInfo.url != null) {
        const url = new URL(tab.url);
        if (url.host == SERVER_JOIN_URL) {
          const roomnum = url.pathname.match(parseUrlAwp)?.groups!["roomnum"];
          if (roomnum == null) {
            console.log(
              ...saveLog("invalid roomnum", url.pathname.substring(1))
            );
          } else {
            clientScript.clientEvent.joinRoom(clientTab, roomnum);
          }
        }
      }

      const clientRoom = clientTab.getClientRoom();
      if (clientRoom == null) return;

      if (changeInfo.status === "loading") {
        console.log(...saveLog("updated: change url", tabId, changeInfo, tab));

        backgroundScript.backgroundUtils.insertScript(tab, tabId);
        setTimeout(
          () => backgroundScript.backgroundUtils.insertScript(tab, tabId),
          1000
        );
        setTimeout(
          () => backgroundScript.backgroundUtils.insertScript(tab, tabId),
          5000
        );
        setTimeout(
          () => backgroundScript.backgroundUtils.insertScript(tab, tabId),
          10000
        );

        if (clientRoom.host) {
          backgroundScript.backgroundSync.changeVideoServer(clientTab, tab);
        } else {
          clientScript.clientSync.syncClient(clientTab);
        }
        backgroundScript.backgroundSync.sendActualUrl(clientTab, tab);
      }

      if (changeInfo.status === "complete") {
        console.log(...saveLog("updated: complete", tabId, changeInfo, tab));
      }
    });
    browser.tabs.onRemoved.addListener((tabId) => {
      clientScript.clientUtils.deleteTab(tabId);
    });
    browser.tabs.onUpdated.addListener(() => {
      backgroundScript.backgroundUtils.changeIcon();
    });
    browser.tabs.onActivated.addListener(() => {
      backgroundScript.backgroundUtils.changeIcon();
    });
    browser.windows.onFocusChanged.addListener(() => {
      backgroundScript.backgroundUtils.changeIcon();
    });

    browser.runtime.onMessage.addListener((message, sender) => {
      if (sender.tab == null) {
        backgroundScript.backgroundUtils.getActiveTab().then(func);
        return;
      }
      func(sender.tab);

      function func(tab: browser.Tabs.Tab | null) {
        if (tab?.id == null) return;
        const tabId = tab.id;
        const clientTab = clientScript.clientContext.clientTabs.get(tabId);
        if (clientTab == null) {
          return;
        }

        switch (message?.command) {
          case eventsBackgroundReceive.ASK_INFO:
            backgroundScript.backgroundEvent.askInfo(clientTab);
            break;
          case eventsBackgroundReceive.ASK_ACTUAL_URL:
            backgroundScript.backgroundEvent.askActualUrl(clientTab, tab);
            break;
          case eventsBackgroundReceive.JOIN_TAB:
            clientScript.clientUtils.createTab(tabId);
            break;
          case eventsBackgroundReceive.CREATE_ROOM:
            clientScript.clientEvent.createRoom(clientTab);
            break;
          case eventsBackgroundReceive.JOIN_ROOM:
            clientScript.clientEvent.joinRoom(clientTab, message.roomnum);
            break;
          case eventsBackgroundReceive.SCRIPT_LOADED:
            backgroundScript.backgroundEvent.scriptLoaded(clientTab);
            break;
          case eventsBackgroundReceive.SEND_STATE:
            backgroundScript.backgroundSync.changeStateServer(
              clientTab,
              message.time,
              message.state
            );
            break;
          case eventsBackgroundReceive.SEND_NAME:
            backgroundScript.backgroundSync.changeNameServer(message.name);
            break;
          case eventsBackgroundReceive.CREATE_MESSAGE:
            backgroundScript.backgroundSync.createMessageServer(
              clientTab,
              message.message
            );
            break;
          case eventsBackgroundReceive.RESTART_SOCKET:
            clientScript.clientUtils.restartSocket(clientTab, message.roomnum);
            break;
          case eventsBackgroundReceive.SYNC_CLIENT:
            clientScript.clientSync.syncClient(clientTab);
            break;
          case eventsBackgroundReceive.REPORT_BUG:
            backgroundScript.backgroundEvent.reportEventTab();
            break;
          default:
            break;
        }
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      const name = changes["name"]?.newValue;
      clientScript.clientEvent.changeNameClient(name);
    });

    function saveLog(...logs: any[]) {
      return clientScript.clientUtils.saveLog(...logs);
    }
  },
};
