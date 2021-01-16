let roomsTabs = {};

function changeVideoClient(tabId, site, location, videoId) {
  console.log("change video client");

  if (roomsTabs[tabId] == null) return;

  let url;
  switch (site) {
    case "wakanim":
      url = `https://www.wakanim.tv/${location}/v2/catalogue/episode/${videoId}`;
      break;
    case "crunchyroll":
      url = `https://www.crunchyroll.com/${location}/${videoId}`;
      break;
    default:
      return;
  }
  browser.tabs.update(tabId, {
    active: true,
    url: url,
  });
}

function createVideoClient(tab) {
  console.log("create video client");

  roomsTabs[tab] = 0;
}

function sendInfo(tabId, roomnum) {
  console.log("get info");

  if (roomnum) roomsTabs[tabId] = roomnum;
}

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
