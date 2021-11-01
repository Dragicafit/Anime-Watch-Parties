import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundUtils } from "./backgroundUtils";

export class BackgroundEvent {
  private clientScript: ClientScript;
  private backgroundUtils: BackgroundUtils;

  constructor(clientScript: ClientScript, clientUtils: BackgroundUtils) {
    this.clientScript = clientScript;
    this.backgroundUtils = clientUtils;
  }

  askInfo(clientTab: ClientTab) {
    console.log("ask info", clientTab);

    browser.runtime
      .sendMessage({
        command: "sendInfo",
        roomnum: clientTab.getRoomnum(),
        onlineUsers: clientTab.getOnlineUsers(),
      })
      .catch(this.clientScript.clientUtils.reportError);

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: "sendInfo",
        roomnum: clientTab.getRoomnum(),
        host: clientTab.getHost(),
      })
      .catch(this.clientScript.clientUtils.reportError);
  }

  scriptLoaded(clientTab: ClientTab) {
    console.log("script loaded", clientTab);

    this.askInfo(clientTab);
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
        this.backgroundUtils.parseUrlTab(tab).then((oldUrl) => {
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
              if (oldUrl?.site === "crunchyroll" && oldUrl?.location != null) {
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
  }

  changeHostClientTab(clientTab: ClientTab): void {
    browser.runtime
      .sendMessage({
        command: "sendInfo",
        roomnum: clientTab.getRoomnum(),
        onlineUsers: clientTab.getOnlineUsers(),
      })
      .catch(this.clientScript!.clientUtils.reportError);
  }

  changeOnlineUsersClientTab(clientTab: ClientTab): void {
    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: "sendInfo",
        roomnum: clientTab.getRoomnum(),
        host: clientTab.getHost(),
      })
      .catch(this.clientScript!.clientUtils.reportError);
  }
}
