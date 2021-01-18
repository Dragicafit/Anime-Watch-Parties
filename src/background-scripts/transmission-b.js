browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab == null) return getActiveTab().then(func);
  func(sender.tab);

  function func(tab) {
    if (tab == null) return;
    let tabId = tab.id;

    switch (message?.command) {
      case "askInfo":
        askInfo(tabId);
        break;
      case "insertScript":
        insertScript(tabId);
        break;
      case "joinRoom":
        joinRoom(tab, tabId, message.roomnum);
        break;
      case "scriptLoaded":
        scriptLoaded(tabId);
        break;
      case "sendState":
        sendState(message.time, message.state);
        break;
      case "restartSocket":
        restartSocket(tabId, message.roomnum);
        break;
      case "syncClient":
        syncClient();
        break;
      default:
        break;
    }
  }
});

socket.on("changeStateClient", (data) =>
  changeStateClient(data?.time, data?.state)
);
socket.on("getUsers", (data) => getUsers(data?.onlineUsers));
socket.on("unSetHost", () => unSetHost());
socket.on("changeVideoClient", (data) =>
  changeVideoClient(data?.site, data?.location, data?.videoId)
);
socket.on("changeHostLabel", (data) => changeHostLabel(data?.username));
