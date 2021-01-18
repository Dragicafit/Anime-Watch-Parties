function syncClient() {
  console.log("sync client");

  window.postMessage(
    {
      direction: "from-script-AWP",
      command: "syncClient",
    },
    window.location.origin
  );
}

function sendState(time, state) {
  console.log("send state");

  window.postMessage(
    {
      direction: "from-script-AWP",
      command: "sendState",
      state: state,
      time: time,
    },
    window.location.origin
  );
}
