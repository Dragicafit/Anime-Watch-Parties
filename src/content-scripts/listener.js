(function () {
  if (window.hasRun) {
    console.log("already running");
    return;
  }
  window.hasRun = true;

  browser.storage.onChanged.addListener((changes) => {
    const token = changes["AWP-token"]?.newValue;
    localStorage.setItem("AWP-token", token);
  });

  let s = document.createElement("script");
  s.src = browser.runtime.getURL(
    "/src/web-accessible-resources/js/player.bundle.js"
  );
  (document.head || document.documentElement).appendChild(s);
})();
