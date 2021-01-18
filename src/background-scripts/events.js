function askInfo(tabId) {
  console.log("ask info");

  browser.runtime.sendMessage({
    command: "sendInfo",
    roomnum: infoTabs[tabId]?.roomnum,
    username: username,
    hostName: infoTabs[tabId]?.hostName,
    onlineUsers: infoTabs[tabId]?.onlineUsers,
  });

  if (infoTabs[tabId] == null) return;

  browser.tabs.sendMessage(tabId, {
    command: "sendInfo",
    roomnum: infoTabs[tabId].roomnum,
    host: infoTabs[tabId].host,
  });
}

function scriptLoaded(tabId) {
  console.log("script loaded");

  if (infoTabs[tabId] == null) return (infoTabs[tabId] = {});

  askInfo(tabId);
}

function joinRoom(tab, tabId, roomnum) {
  console.log(`join room`);

  socket.emit("joinRoom", { roomnum: roomnum }, (err, data) => {
    if (err) {
      console.log(err);
      if (err === "not connected") {
        openPopupTwitch(tabId, roomnum);
      }
      return;
    }
    username = data.username;

    if (infoTabs[tabId] == null) infoTabs[tabId] = {};
    infoTabs[tabId].roomnum = data.roomnum;
    infoTabs[tabId].host = data.host;
    infoTabs[tabId].hostName = data.hostName;

    if (data.host) {
      console.log("You are the new host!");
      changeVideoServer(tab);
      askState(tabId);
    } else {
      startEmbed(tabId);
    }
    console.log(`send user name after new user ${username}`);
    console.log(`send room number after joinRoom ${data.roomnum}`);

    askInfo(tabId);
  });
}

function changeStateClient(time, state) {
  console.log(`change state client`);
  //
  if (Object.keys(infoTabs).length == 0) return;
  let tabId = +Object.keys(infoTabs)[0];
  //
  browser.tabs.sendMessage(tabId, {
    command: "changeStateClient",
    time: time,
    state: state,
  });
}

function sendState(time, state) {
  console.log(`send state`);
  changeStateServer(time, state);
}

function getUsers(newOnlineUsers) {
  console.log(`get users: ${newOnlineUsers}`);

  //
  if (Object.keys(infoTabs).length == 0) return;
  let tabId = +Object.keys(infoTabs)[0];
  //

  if (infoTabs[tabId] == null) return;

  infoTabs[tabId].onlineUsers = newOnlineUsers;

  askInfo(tabId);
}

function unSetHost() {
  console.log("Unsetting host");

  //
  if (Object.keys(infoTabs).length == 0) return;
  let tabId = +Object.keys(infoTabs)[0];
  //
  if (infoTabs[tabId] == null) return;

  infoTabs[tabId].host = false;

  askInfo(tabId);
}

function changeVideoClient(site, location, videoId) {
  console.log("change video client");
  console.log(`video id is: ${videoId}`);

  //
  if (Object.keys(infoTabs).length == 0) return;
  let tabId = +Object.keys(infoTabs)[0];
  //

  if (infoTabs[tabId] == null) return;

  browser.tabs
    .get(tabId)
    .then((tab) => {
      let url = parseUrl(tab.url);

      if (
        url.site === site &&
        url.location === location &&
        url.videoId === videoId
      )
        return;

      let newUrl;
      switch (site) {
        case "wakanim":
          newUrl = `https://www.wakanim.tv/${location}/v2/catalogue/episode/${videoId}`;
          break;
        case "crunchyroll":
          newUrl = `https://www.crunchyroll.com/${location}/${videoId}`;
          break;
        default:
          return;
      }
      browser.tabs.update(tabId, {
        active: true,
        url: newUrl,
      });
    })
    .catch(reportError);
}

function changeHostLabel(username) {
  console.log("change host label");
  //
  if (Object.keys(infoTabs).length == 0) return;
  let tabId = +Object.keys(infoTabs)[0];
  //
  if (infoTabs[tabId] == null) return;

  infoTabs[tabId].hostName = username;
}

function restartSocket(tabId, roomnum) {
  socket.close();
  setTimeout(() => {
    socket.connect();
    joinRoom(tabId, roomnum);
  }, 100);
}
