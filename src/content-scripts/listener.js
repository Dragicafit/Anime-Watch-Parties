(function () {
  if (window.hasRun) {
    console.log("already running");
    browser.runtime.sendMessage({
      command: "scriptLoaded",
    });
    return;
  }
  window.hasRun = true;

  browser.runtime.onMessage.addListener((message) => {
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
    browser.runtime.sendMessage(event.data);
  });

  let s = document.createElement("script");
  s.src = browser.runtime.getURL(
    "/built/src/web-accessible-resources/js/script.js"
  );
  s.onload = function () {
    browser.runtime.sendMessage({
      command: "scriptLoaded",
    });
  };
  (document.head || document.documentElement).appendChild(s);
})();
