import browser from "webextension-polyfill";
import { DiscordContext } from "./discordContext";
import { DiscordSocket } from "./discordSocket";
import { DiscordTransmission } from "./discordTransmission";
import { DiscordUtils as DiscordUtils } from "./discordUtils";

export class DiscordScript {
  discordSocket: DiscordSocket;

  constructor(context: DiscordContext) {
    let discordUtils = new DiscordUtils(context);
    this.discordSocket = new DiscordSocket(context);
    let discordTransmission = new DiscordTransmission(
      context,
      this.discordSocket,
      discordUtils
    );

    discordTransmission.start();

    browser.storage.local.get("discordToken").then((item) => {
      if (item["discordToken"] != null) {
        this.discordSocket.start(item["discordToken"]);
      }
    });
  }
}
