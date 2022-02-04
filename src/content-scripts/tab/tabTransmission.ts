import browser from "webextension-polyfill";
import { TabContext } from "./tabContext";
import { TabEvents } from "./tabEvents";

export default {
  start: function (tabContext: TabContext, tabEvent: TabEvents) {
    browser.runtime.onMessage.addListener((message, sender) => {
      switch (message?.command) {
        case "sendInfo":
          tabEvent.sendInfo(message.clientRoom, message.clientContext);
          break;
        case "sendActualUrl":
          tabEvent.sendActualUrl(message.actualUrl);
          break;
      }
    });
  },
};
