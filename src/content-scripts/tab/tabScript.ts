import browser from "webextension-polyfill";
import $ from "jquery";
import { TwitchEmbed } from "./embed/twitchEmbed";
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
  let twitchEmbed = new TwitchEmbed(tabContext, tabSync);
  tabContext.embed = twitchEmbed;

  $(() => {
    twitchEmbed.startEmbed();

    browser.runtime
      .sendMessage({
        command: "askInfo",
      })
      .catch(console.error);
  });
}
