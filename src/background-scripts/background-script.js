let infoTabs = {};
let server = "https://localhost:4000";
let socket = io.connect(server, {
  secure: true,
  withCredentials: true,
});
let username = "";
let parseUrlWakanim = /^https:\/\/www\.wakanim\.tv\/(?<location>\w+)\/v2\/\w+\/episode\/(?<videoId>\d+)/;
let parseUrlCrunchyroll = /^https:\/\/www\.crunchyroll\.com\/(?<location>\w+)\/(?<videoId>[\w\/-]+)/;

function getActiveTab() {
  console.log("get active tab");

  return new Promise((resolve) => {
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
          .catch(reportError);
      })
      .catch(reportError);
  });
}

function insertScript(tabId) {
  console.log("insert script");

  browser.tabs
    .executeScript(tabId, {
      runAt: "document_end",
      file: "/src/content-scripts/listener.js",
    })
    .catch(reportError);
}

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;
  if (infoTabs[tabId] == null) return;
  console.log("updated");
  insertScript(tabId);
});

function reportError(error) {
  console.error(`error: ${error}`);
}
