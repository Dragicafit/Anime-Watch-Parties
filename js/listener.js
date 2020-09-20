(function () {
  if (window.hasRun) {
    console.log("already running");
    chrome.runtime.sendMessage({
      command: "sciptLoaded",
    });
    return;
  }
  window.hasRun = true;

  chrome.runtime.onMessage.addListener((message) => {
    message.direction = "from-content-AWP";
    window.postMessage(message, "https://www.wakanim.tv");
  });

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      !event.data ||
      event.data.direction !== "from-script-AWP"
    )
      return;
    chrome.runtime.sendMessage(event.data);
  });

  let s = document.createElement("script");
  s.src = chrome.runtime.getURL("/js/script.js");
  s.onload = function () {
    chrome.runtime.sendMessage({
      command: "sciptLoaded",
    });
  };
  (document.head || document.documentElement).appendChild(s);

  let css = document.createElement("link");
  css.rel = "stylesheet";
  css.type = "text/css";
  css.href = chrome.runtime.getURL("/css/script.css");
  (document.head || document.documentElement).appendChild(css);
})();
