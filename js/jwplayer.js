class jwplayerSetup extends playerSetup {
  _onPlay() {
    jwplayer().on("play", (e) => {
      console.log("jwplayer playing", e);
      if (!host) {
        if (e.playReason === "interaction" && e.reason === "playing")
          socket.emit("syncClient");
        return;
      }
      changeState(this.getTime(), true);
    });
  }
  _onPause() {
    jwplayer().on("pause", (e) => {
      console.log("jwplayer pausing", e);
      if (!host) return;
      changeState(this.getTime(), false);
    });
  }
  _onSeek() {
    jwplayer().on("seek", (e) => {
      console.log("jwplayer seeking", e);
      if (!host) return;
      changeState(e.offset, this.isPlay());
    });
  }

  _getTime() {
    return jwplayer().getPosition();
  }

  _isPlay() {
    return jwplayer().getState() === "playing";
  }

  _seekTo(time) {
    jwplayer().seek(time);
  }

  _setState(state) {
    if (state) jwplayer().play();
    else jwplayer().pause();
  }

  _playerExist() {
    return typeof jwplayer === "function";
  }
}
