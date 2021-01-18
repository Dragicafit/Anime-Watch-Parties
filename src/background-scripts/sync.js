function parseUrl(url) {
  console.log("parse url");

  let pathname = url.match(parseUrlWakanim);
  if (pathname != null) {
    return {
      videoId: pathname.groups.videoId,
      site: "wakanim",
      location: pathname.groups.location,
    };
  }
  pathname = url.match(parseUrlCrunchyroll);
  if (pathname != null) {
    return {
      videoId: pathname.groups.videoId,
      site: "crunchyroll",
      location: pathname.groups.location,
    };
  }
  return {};
}

function askState(tabId) {
  console.log("ask state");

  browser.tabs.sendMessage(tabId, {
    command: "askState",
  });
}

function startEmbed(tabId) {
  console.log("start embed");

  browser.tabs.sendMessage(tabId, {
    command: "startEmbed",
  });
}

function changeVideoServer(tab) {
  console.log("change video server");

  let url = parseUrl(tab.url);
  console.log(`change video to ${url.videoId}`);

  socket.emit("changeVideoServer", {
    room: infoTabs[tab.id].roomnum,
    videoId: url.videoId,
    site: url.site,
    location: url.location,
  });
}

function changeStateServer(currTime, state) {
  console.log("change state server");

  socket.emit("changeStateServer", {
    time: currTime,
    state: state,
  });
}

function syncClient() {
  console.log("sync client");

  socket.emit("syncClient");
}

function openPopupTwitch(tabId, roomnum) {
  console.log("open popup twitch");

  browser.tabs.sendMessage(tabId, {
    command: "openPopupTwitch",
    roomnum: roomnum,
  });
}
