let roomsTabs = {};

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.command === "changeVideoClient") {
    let tabId = sender.tab.id;
    console.log("change video client");

    if (roomsTabs[tabId] == null) return;

    let url;
    switch (message.site) {
      case "wakanim":
        url = `https://www.wakanim.tv/${message.location}/v2/catalogue/episode/${message.videoId}`;
        break;
      case "crunchyroll":
        url = `https://www.crunchyroll.com/${message.location}/${message.videoId}`;
        break;
      default:
        return;
    }
    browser.tabs.update(tabId, {
      active: true,
      url: url,
    });
  } else if (message.command === "createVideoClient") {
    console.log("create video client");

    roomsTabs[message.tab] = 0;
  } else if (message.command === "sendInfo") {
    let tabId = sender.tab.id;
    console.log("get info");

    if (message.roomnum) roomsTabs[tabId] = message.roomnum;
  }
});

function joinRoom(tabId) {
  console.log("joinRoom");
  browser.tabs
    .sendMessage(tabId, {
      command: "joinRoom",
      roomnum: roomsTabs[tabId],
    })
    .catch(reportError);
}

function insertScript(tabId) {
  let listener = (message) => {
    if (message.command !== "sciptLoaded") return;
    console.log("scipt loaded");
    browser.runtime.onMessage.removeListener(listener);
    joinRoom(tabId);
  };
  browser.runtime.onMessage.addListener(listener);

  console.log("executeScript");
  browser.tabs
    .executeScript(tabId, {
      runAt: "document_end",
      file: "/js/listener.js",
    })
    .catch(reportError);
}

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;
  if (roomsTabs[tabId] == null) return;
  console.log("updated");
  insertScript(tabId);
});

function reportError(error) {
  console.error(`Could not beastify: ${error}`);
}
