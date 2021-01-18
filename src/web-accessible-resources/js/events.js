function changeStateClient(time, state) {
  console.log("change state client");

  setTimeout(() => {
    awpplayer.getTime().then((clientTime) => {
      console.log(`current time is: ${clientTime}`);
      console.log(`current time server is: ${time}`);
      console.log(`current state server is: ${state}`);

      awpplayer.setState(state);

      if (Math.abs(clientTime - time) > 0.2) awpplayer.seekTo(time);
    });
  }, delay);
}

function openPopupTwitch(roomnum) {
  console.log("open popup twitch");

  if (popupTwitch == null || popupTwitch.closed) {
    popupTwitch = window.open(
      `${server}/auth/twitch`,
      "Twitch",
      "width=1024,height=600,scrollbars=yes"
    );
  } else {
    return popupTwitch.focus();
  }
  if (popupTwitch == null) return;

  window.addEventListener("message", (event) => {
    if (
      event.source !== popupTwitch ||
      event.origin !== server ||
      event.data?.direction !== "from-popupTwitch-AWP"
    )
      return;
    if (event.data.command === "success") {
      popupTwitch.close();
      window.postMessage(
        {
          direction: "from-script-AWP",
          command: "restartSocket",
          roomnum: roomnum,
        },
        window.location.origin
      );
    }
  });
}

function sendInfo(newRoomnum, newHost) {
  console.log("send info");

  if (newRoomnum != null) roomnum = newRoomnum;
  if (newHost != null) host = newHost;
}

function askState() {
  console.log("ask state");

  awpplayer.getTime().then((time) => {
    awpplayer.isPlay().then((state) => {
      sendState(time, state);
    });
  });
}
