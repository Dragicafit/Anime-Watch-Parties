import {
  parseUrlCrunchyroll,
  parseUrlFunimation,
  parseUrlWakanim,
} from "./clientConst";
import { ClientContext } from "./clientContext";
import { ClientTab } from "./clientTab";

export class ClientUtils {
  clientContext: ClientContext;

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
  }

  getActiveTab() {
    console.log("get active tab");

    return new Promise<browser.tabs.Tab>((resolve) => {
      browser.tabs
        .query({
          currentWindow: true,
          active: true,
        })
        .then((tabs) => {
          if (tabs.length > 0) return resolve(tabs[0]);
          browser.tabs
            .create({ url: "https://www.wakanim.tv/" })
            .then((tab) => resolve(tab))
            .catch(this.reportError);
        })
        .catch(this.reportError);
    });
  }

  insertScript(tab: browser.tabs.Tab, tabId: number) {
    console.log("insert script");

    browser.tabs
      .executeScript(tabId, {
        runAt: "document_end",
        file: "/src/content-scripts/listener.js",
      })
      .catch(this.reportError);
    this.joinTab(tab, tabId);
  }

  joinTab(tab: browser.tabs.Tab, tabId: number) {
    if (!this.clientContext.clientTabs.has(tabId)) {
      this.clientContext.clientTabs.set(
        tabId,
        new ClientTab(this.clientContext)
      );
    }
    this.changeIcon(tabId, tab);
  }

  parseUrl(url: string) {
    console.log("parse url");

    let pathname = url.match(parseUrlWakanim);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "wakanim",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlCrunchyroll);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "crunchyroll",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlFunimation);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "funimation",
        location: pathname.groups!.location,
      };
    }
    return null;
  }

  changeIcon(tabId: number, tab: browser.tabs.Tab) {
    if (!this.clientContext.clientTabs.has(tabId)) {
      browser.browserAction.setIcon({
        path: "src/icons/desactivate.svg",
      });
      return;
    }
    let url = this.parseUrl(tab.url!);
    switch (url?.site) {
      case "wakanim":
        browser.browserAction.setIcon({ path: "src/icons/wakanim.svg" });
        break;
      case "crunchyroll":
        browser.browserAction.setIcon({
          path: "src/icons/crunchyroll.svg",
        });
        break;
      case "funimation":
        browser.browserAction.setIcon({
          path: "src/icons/funimation.svg",
        });
        break;
      default:
        browser.browserAction.setIcon({
          path: "src/icons/activate.svg",
        });
    }
  }

  reportError(error: any) {
    console.error(`error: ${error}`);
  }
}
