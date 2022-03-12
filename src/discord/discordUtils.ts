import browser from "webextension-polyfill";
import { DiscordContext } from "./discordContext";

export class DiscordUtils {
  private context: DiscordContext;
  constructor(context: DiscordContext) {
    this.context = context;
  }

  injectDiscord() {
    this.context.searchingToken = true;
    browser.tabs
      .query({ url: "https://discord.com/channels/*" })
      .then((tabs) => {
        if (tabs.length === 0) {
          browser.tabs
            .create({
              active: true,
              url: "https://discord.com/channels/@me",
            })
            .then((tab) => {
              this.context.tabIdToDelete = tab.id;
            });
          return;
        }
        tabs.forEach((tab) => {
          browser.tabs.reload(tab.id);
        });
      });
  }
}
