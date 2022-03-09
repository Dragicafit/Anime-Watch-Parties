import browser from "webextension-polyfill";
import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { SERVER_URL } from "./backgroundConst";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundEvent {
  private clientScript: ClientScript;
  private backgroundScript: BackgroundScript;

  constructor(clientScript: ClientScript, backgroundScript: BackgroundScript) {
    this.clientScript = clientScript;
    this.backgroundScript = backgroundScript;
  }

  askInfo(clientTab: ClientTab) {
    console.log(...this.saveLog("ask info", clientTab));

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  askActualUrl(clientTab: ClientTab, tab: browser.Tabs.Tab): void {
    console.log(...this.saveLog("ask actual url", clientTab));

    this.backgroundScript.backgroundSync.sendActualUrl(clientTab, tab);
  }

  scriptLoaded(clientTab: ClientTab) {
    console.log(...this.saveLog("script loaded", clientTab));

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeStateClientTab(clientTab: ClientTab): void {
    console.log(...this.saveLog("change state client tab", clientTab));

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: "changeStateClient",
        time: clientRoom.getCurrTime(),
        state: clientRoom.getState(),
      })
      .catch(() => {
        setTimeout(() => {
          browser.tabs
            .sendMessage(clientTab.getTabId(), {
              command: "changeStateClient",
              time: clientRoom.getCurrTime(),
              state: clientRoom.getState(),
            })
            .catch(() => {});
        }, 50);
      });

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeVideoClientTab(clientTab: ClientTab) {
    console.log(...this.saveLog("change video client tab", clientTab));

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) return;

    const url = clientRoom.getUrl();
    if (url == null) return;

    const tabId = clientTab.getTabId();
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
                  newUrl = `https://www.crunchyroll.com/${oldUrl.location}/${url.videoId}`;
                } else {
                  newUrl = `https://www.crunchyroll.com/${url.videoId}`;
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
                newUrl = `https://animedigitalnetwork.fr/video/${url.videoId}`;
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

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeHostClientTab(clientTab: ClientTab): void {
    console.log(...this.saveLog("change host client tab", clientTab));

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeOnlineUsersClientTab(clientTab: ClientTab): void {
    console.log(...this.saveLog("change online users client tab", clientTab));

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  reportEventTab() {
    console.log(...this.saveLog("report a bug tab"));

    this.clientScript.clientSync.reportBug();

    browser.tabs.create({
      active: true,
      url: `${SERVER_URL}/reportBug`,
    });
  }

  private saveLog(...logs: any[]) {
    return this.clientScript.clientUtils.saveLog(...logs);
  }

  private saveError(...errors: any[]) {
    return this.clientScript.clientUtils.saveError(...errors);
  }
}
