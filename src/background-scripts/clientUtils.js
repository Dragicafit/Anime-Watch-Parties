const { ClientContext } = require("./clientContext");

class ClientUtils {
  /** @type {ClientContext} */
  clientContext;

  /** @param {ClientContext} clientContext */
  constructor(clientContext) {
    this.clientContext = clientContext;
  }

  getActiveTab() {
    console.log("get active tab");

    return new Promise((resolve) => {
      this.clientContext.browser.tabs
        .query({
          currentWindow: true,
          active: true,
          url: ["*://*.wakanim.tv/*", "*://*.crunchyroll.com/*"],
        })
        .then((tabs) => {
          if (tabs.length !== 0) return resolve(tabs[0]);
          this.clientContext.browser.tabs
            .create({ url: "https://www.wakanim.tv/" })
            .then((tab) => resolve(tab))
            .catch(this.reportError);
        })
        .catch(this.reportError);
    });
  }

  insertScript(tabId) {
    console.log("insert script");

    this.clientContext.browser.tabs
      .executeScript(tabId, {
        runAt: "document_end",
        file: "/src/content-scripts/listener.js",
      })
      .catch(this.reportError);
  }

  reportError(error) {
    console.error(`error: ${error}`);
  }
}

exports.ClientUtils = ClientUtils;
