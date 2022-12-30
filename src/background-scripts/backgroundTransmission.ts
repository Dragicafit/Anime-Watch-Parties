import browser from "webextension-polyfill";
import { BackgroundScript } from "./backgroundScript";

export default {
  start: function (backgroundScript: BackgroundScript) {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url != null) {
        console.log(...saveLog("updated: change url", tabId, changeInfo, tab));
        backgroundScript.backgroundUtils.insertScript(tab, tabId);
      }

      if (changeInfo.status === "complete") {
        console.log(...saveLog("updated: complete", tabId, changeInfo, tab));
      }
    });
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
        // const tabId = tab.id;

        switch (message?.command) {
          // case eventsBackgroundReceive.ASK_ACTUAL_URL:
          //   backgroundScript.backgroundEvent.askActualUrl(clientTab, tab);
          //   break;
          // case eventsBackgroundReceive.REPORT_BUG:
          //   backgroundScript.backgroundEvent.reportEventTab();
          //   break;
          default:
            break;
        }
      }
    });

    function saveLog(...logs: any[]) {
      return logs;
    }
  },
};
