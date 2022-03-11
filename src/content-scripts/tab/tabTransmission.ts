import browser from "webextension-polyfill";
import { eventsBackgroundSend } from "../../background-scripts/backgroundConst";
import { TabContext } from "./tabContext";
import { TabEvents } from "./tabEvents";

export default {
  start: function (tabContext: TabContext, tabEvent: TabEvents) {
    browser.runtime.onMessage.addListener((message, sender) => {
      switch (message?.command) {
        case eventsBackgroundSend.SEND_INFO:
          tabEvent.sendInfo(message.clientRoom, message.clientContext);
          break;
        case eventsBackgroundSend.SEND_ACTUAL_URL:
          tabEvent.sendActualUrl(message.actualUrl);
          break;
      }
    });
  },
};
