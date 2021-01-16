browser.runtime.onMessage.addListener((message, sender) => {
  let tabId = sender.tab?.id;
  switch (message?.command) {
    case "changeVideoClient":
      changeVideoClient(tabId, message.site, message.location, message.videoId);
      break;
    case "createVideoClient":
      createVideoClient(message.tab);
      break;
    case "sendInfo":
      sendInfo(tabId, message.roomnum);
      break;
    default:
      break;
  }
});
