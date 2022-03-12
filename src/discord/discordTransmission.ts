import _ from "lodash";
import browser from "webextension-polyfill";
import { DiscordContext } from "./discordContext";
import { DiscordSocket } from "./discordSocket";
import { DiscordUtils } from "./discordUtils";

export class DiscordTransmission {
  private context: DiscordContext;
  private discordSocket: DiscordSocket;
  private discordUtils: DiscordUtils;

  constructor(
    context: DiscordContext,
    discordSocket: DiscordSocket,
    discordUtils: DiscordUtils
  ) {
    this.context = context;
    this.discordSocket = discordSocket;
    this.discordUtils = discordUtils;
  }

  start() {
    browser.permissions.onAdded.addListener((permissions) => {
      if (
        _.isEqual(permissions, {
          origins: ["https://discord.com/*"],
          permissions: [],
        })
      ) {
        this.discordUtils.injectDiscord();
      }
    });

    browser.runtime.onMessage.addListener((message, sender) => {
      switch (message?.command) {
        case "sendDiscordToken":
          if (this.context.tabIdToDelete != null) {
            browser.tabs.remove(this.context.tabIdToDelete);
            this.context.tabIdToDelete = undefined;
          }
          browser.storage.local.set({ discordToken: message?.discordToken });
          break;
        case "injectDiscord":
          browser.storage.local.get("discordToken").then((item) => {
            if (item["discordToken"] != null) {
              browser.storage.local.remove("discordToken");
              return;
            }
            browser.permissions
              .contains({
                origins: ["https://discord.com/channels/*"],
              })
              .then((result) => {
                if (!result) {
                  return;
                }
                this.discordUtils.injectDiscord();
              });
          });
          break;
        case "sendActivity":
          const tabId = sender.tab?.id;
          if (tabId == null) {
            return;
          }
          this.context.lastTabId = tabId;

          this.discordSocket.sendActivity({
            serieName: message.serieName,
            episodeNumber: message.episodeNumber,
            serieNumber: message.serieNumber,
            onlineUsers: message.onlineUsers,
            site: message.site,
            playing: message.playing,
            roomId: message.roomId,
            urlSerie: message.urlSerie,
          });
      }
    });

    browser.tabs.onUpdated.addListener(
      (tabId) => {
        if (!this.context.searchingToken) {
          return;
        }
        browser.permissions
          .contains({
            origins: ["https://discord.com/channels/*"],
          })
          .then((result) => {
            if (!result) {
              return;
            }
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_start",
                file: "/src/content-scripts/discord.js",
              })
              .catch((error) => console.error(error));
          });
      },
      {
        urls: ["https://discord.com/channels/*"],
        properties: ["status", "url"],
      }
    );

    browser.tabs.onRemoved.addListener((tabId) => {
      if (tabId == this.context.lastTabId) {
        this.discordSocket.sendActivity(null);
      }
    });

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName != "local") {
        return;
      }
      if (
        changes["discordToken"] != null &&
        changes["discordToken"].newValue != changes["discordToken"].oldValue
      ) {
        this.discordSocket.start(changes["discordToken"].newValue);
      }
    });
  }
}
