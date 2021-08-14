import { ClientContext } from "./clientContext";

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
          url: ["*://*.wakanim.tv/*", "*://*.crunchyroll.com/*"],
        })
        .then((tabs) => {
          if (tabs.length !== 0) return resolve(tabs[0]);
          browser.tabs
            .create({ url: "https://www.wakanim.tv/" })
            .then((tab) => resolve(tab))
            .catch(this.reportError);
        })
        .catch(this.reportError);
    });
  }

  insertScript(tabId: number) {
    console.log("insert script");

    browser.tabs
      .executeScript(tabId, {
        runAt: "document_end",
        file: "/src/content-scripts/listener.js",
      })
      .catch(this.reportError);
  }

  reportError(error: any) {
    console.error(`error: ${error}`);
  }
}
