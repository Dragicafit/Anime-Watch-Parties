(function () {
  if (window.hasRun) {
    console.log("already running");
    chrome.runtime.sendMessage({
      command: "scriptLoaded",
    });
    return;
  }
  window.hasRun = true;

  chrome.runtime.onMessage.addListener((message) => {
    message.direction = "from-content-AWP";
    window.postMessage(message, window.location.origin);
  });

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      event.origin !== window.location.origin ||
      event.data?.direction !== "from-script-AWP"
    )
      return;
    chrome.runtime.sendMessage(event.data);
  });

  let s = document.createElement("script");
  s.src = chrome.runtime.getURL(
    "/src/web-accessible-resources/js/player-script.js"
  );
  s.onload = function () {
    chrome.runtime.sendMessage({
      command: "scriptLoaded",
    });
  };
  (document.head || document.documentElement).appendChild(s);
})();
