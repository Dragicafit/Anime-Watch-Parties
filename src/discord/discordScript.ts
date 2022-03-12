import browser from "webextension-polyfill";
import { DiscordContext } from "./discordContext";
import { DiscordSocket } from "./discordSocket";
import { DiscordTransmission } from "./discordTransmission";
import { DiscordUtils as DiscordUtils } from "./discordUtils";

export class DiscordScript {
  constructor() {
    let context = new DiscordContext();
    let discordUtils = new DiscordUtils(context);
    let discordSocket = new DiscordSocket(context);
    let discordTransmission = new DiscordTransmission(
      context,
      discordSocket,
      discordUtils
    );

    discordTransmission.start();

    browser.storage.local.get("discordToken").then((item) => {
      if (item["discordToken"] != null) {
        discordSocket.start(item["discordToken"]);
      }
    });
  }
}
