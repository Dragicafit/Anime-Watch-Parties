import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundEvent {
  private clientScript: ClientScript;
  private backgroundScript: BackgroundScript;

  constructor(clientScript: ClientScript, backgroundScript: BackgroundScript) {
    this.clientScript = clientScript;
    this.backgroundScript = backgroundScript;
  }

  askInfo(clientTab: ClientTab) {
    console.log("ask info", clientTab);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  scriptLoaded(clientTab: ClientTab) {
    console.log("script loaded", clientTab);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeStateClientTab(clientTab: ClientTab): void {
    console.log("change state client tab", clientTab);

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
      .catch(this.clientScript.clientUtils.reportError);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeVideoClientTab(clientTab: ClientTab) {
    console.log("change video client tab", clientTab);

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
            console.log("old url is", oldUrl);
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
            console.log("change video client to", newUrl);
            browser.tabs.update(tabId, {
              active: true,
              url: newUrl,
            });
          });
      })
      .catch(this.clientScript.clientUtils.reportError);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeHostClientTab(clientTab: ClientTab): void {
    console.log("change host client tab", clientTab);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeOnlineUsersClientTab(clientTab: ClientTab): void {
    console.log("change online users client tab", clientTab);

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }
}
