import browser from "webextension-polyfill";
import { eventsBackgroundReceive } from "../../background-scripts/backgroundConst";
import { TabContext } from "./tabContext";

export class TabSync {
  tabContext: TabContext;

  constructor(tabContext: TabContext) {
    this.tabContext = tabContext;
  }

  syncClient(): void {
    console.log("sync client");

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: eventsBackgroundReceive.SYNC_CLIENT,
      },
      this.tabContext.window.location.origin
    );
  }

  sendName(name: string | null): void {
    console.log("send name", name);

    if (name != null) {
      browser.runtime.sendMessage({
        command: eventsBackgroundReceive.SEND_NAME,
        name: name,
      });
    } else {
      browser.storage.local.set({ name: null });
    }
  }

  createMessage(message: string): void {
    console.log("create message", message);

    browser.runtime.sendMessage({
      command: eventsBackgroundReceive.CREATE_MESSAGE,
      message: message,
    });
  }

  sendActivity(): void {
    console.log("send activity");

    browser.runtime.sendMessage({
      command: "sendActivity",
      serieName: "Miss Kobayashi's Dragon Maid",
      episodeNumber: 1,
      serieNumber: 1,
      onlineUsers: 3,
      site: "crunchyroll",
      playing: true,
      roomId: "https://awp.moe/cVkSI",
      urlSerie: "https://www.crunchyroll.com/fr/miss-kobayashis-dragon-maid",
    });
  }
}
