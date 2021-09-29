(function () {
  if (window.hasRun3) {
    console.log("already running 3");
    return;
  }
  window.hasRun3 = true;

  document.body.innerHTML = "<h1>Waiting for host</h1>";
})();
