(function () {
  if (window.hasRun) {
    console.log("already running");
    browser.runtime.sendMessage({
      command: "sciptLoaded",
    });
    return;
  }
  window.hasRun = true;

  browser.runtime.onMessage.addListener((message) => {
    message.direction = "from-content-AWP";
    window.postMessage(message, window.location.origin);
  });

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.direction !== "from-script-AWP")
      return;
    browser.runtime.sendMessage(event.data);
  });

  let s = document.createElement("script");
  s.src = browser.runtime.getURL("/js/script.js");
  s.onload = function () {
    browser.runtime.sendMessage({
      command: "sciptLoaded",
    });
  };
  (document.head || document.documentElement).appendChild(s);

  let css = document.createElement("link");
  css.rel = "stylesheet";
  css.type = "text/css";
  css.href = browser.runtime.getURL("/css/script.css");
  (document.head || document.documentElement).appendChild(css);
})();
