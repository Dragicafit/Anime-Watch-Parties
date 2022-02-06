(function () {
  if (window.hasRun2) {
    console.log("already running 2");
    return;
  }
  window.hasRun2 = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    message.direction = "from-content-AWP";
    if (message.command === "askUrlSerie") {
      console.log("ask url serie");
      sendResponse(
        document.head.querySelector("[property='video:series'][content]")
          .content
      );
      return;
    }
    sendResponse(null);
  });
})();
