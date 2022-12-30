import browser from "webextension-polyfill";
import { SupportedSite } from "../server/io/ioConst";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundEvent {
  private backgroundScript: BackgroundScript;

  constructor(backgroundScript: BackgroundScript) {
    this.backgroundScript = backgroundScript;
  }

  changeVideoClientTab(
    url: {
      videoId: string;
      site: SupportedSite;
      location?: string;
    },
    tabId: number
  ) {
    console.log(...this.saveLog("change video client tab"));

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.backgroundScript.backgroundUtils
          .parseUrlTab(tab)
          .then((oldUrl) => {
            console.log(...this.saveLog("old url is", oldUrl));
            if (oldUrl?.site === url.site && oldUrl?.videoId === url.videoId) {
              return;
            }

            let newUrl;
            switch (url.site) {
              case "wakanim":
                newUrl = `https://www.wakanim.tv/${url.location}/v2/catalogue/episode/${url.videoId}`;
                break;
              case "crunchyroll":
                if (
                  oldUrl?.site === "crunchyroll" &&
                  oldUrl?.location != null
                ) {
                  newUrl = `https://www.crunchyroll.com/${oldUrl.location}/watch/${url.videoId}`;
                } else {
                  newUrl = `https://www.crunchyroll.com/watch/${url.videoId}`;
                }
                break;
              case "funimation":
                if (oldUrl?.site === "funimation" && oldUrl?.location != null) {
                  newUrl = `https://www.funimation.com/${oldUrl.location}/shows/${url.videoId}`;
                } else {
                  newUrl = `https://www.funimation.com/v/${url.videoId}`;
                }
                break;
              case "adn":
                newUrl = `https://animationdigitalnetwork.fr/video/${url.videoId}`;
                break;
              default:
                return;
            }
            console.log(...this.saveLog("change video client to", newUrl));
            browser.tabs.update(tabId, {
              active: true,
              url: newUrl,
            });
          });
      })
      .catch((error) => console.error(...this.saveError(error)));
  }

  private saveLog(...logs: any[]) {
    return logs;
  }

  private saveError(...errors: any[]) {
    return errors;
  }
}
