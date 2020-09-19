if (jwplayerExist()) {
  jwplayer().on("play", (e) => {
    console.log("jwplayer playing", e);
    if (!host) {
      if (e.playReason === "interaction" && e.reason === "playing")
        socket.emit("syncClient");
      return;
    }
    changeState(getTime(), true);
  });

  jwplayer().on("pause", (e) => {
    console.log("jwplayer pausing", e);
    if (!host) return;
    changeState(getTime(), false);
  });

  jwplayer().on("seek", (e) => {
    console.log("jwplayer seeking", e);
    if (!host) return;
    changeState(e.offset, isPlay());
  });
}

function getTime() {
  if (!jwplayerExist()) return 0;
  return jwplayer().getPosition();
}

function isPlay() {
  if (!jwplayerExist()) return false;
  return jwplayer().getState() === "playing";
}

function seekTo(time) {
  if (!jwplayerExist()) return;
  jwplayer().seek(time);
}

function setState(state) {
  if (!jwplayerExist()) return;
  if (state) jwplayer().play();
  else jwplayer().pause();
}

function jwplayerExist() {
  return typeof jwplayer === "function";
}
