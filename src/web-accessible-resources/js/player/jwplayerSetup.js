class jwplayerSetup extends awpplayerSetup {
  constructor() {
    super("jwplayer");
  }

  _onPlay(a) {
    jwplayer().on("play", (e) => {
      if (host || (e.playReason === "interaction" && e.reason === "playing"))
        a(e);
    });
  }

  _onPause(a) {
    jwplayer().on("pause", (e) => a(e));
  }

  _onSeek(a) {
    jwplayer().on("seek", (e) => a(e.offset, e));
  }

  _getTime() {
    return Promise.resolve(jwplayer().getPosition());
  }

  _isPlay() {
    return Promise.resolve(jwplayer().getState() === "playing");
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