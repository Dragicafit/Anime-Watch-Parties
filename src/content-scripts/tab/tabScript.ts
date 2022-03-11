import $ from "jquery";
import browser from "webextension-polyfill";
import { eventsBackgroundReceive } from "../../background-scripts/backgroundConst";
import { ChatEmbed } from "./embed/chatEmbed";
import { TabContext } from "./tabContext";
import { TabEvents } from "./tabEvents";
import { TabRoom } from "./tabRoom";
import { TabSync } from "./tabSync";
import tabTransmission from "./tabTransmission";

if (!(<any>window).AWPHasRun) {
  (<any>window).AWPHasRun = true;

  let tabContext = new TabContext(new TabRoom(), $, window, window.performance);

  let tabSync = new TabSync(tabContext);
  let tabEvents = new TabEvents(tabContext, tabSync);
  tabTransmission.start(tabContext, tabEvents);
  let chatEmbed = new ChatEmbed(tabContext, tabSync);
  tabContext.embed = chatEmbed;

  $(() => {
    chatEmbed.startEmbed().then(() => {
      browser.runtime
        .sendMessage({
          command: eventsBackgroundReceive.ASK_INFO,
        })
        .catch(console.error);
    });
  });
}
