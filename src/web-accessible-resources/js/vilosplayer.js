class vilosplayerSetup extends playerSetup {
  previousSeek = 0;

  constructor() {
    super("vilosplayer");
  }

  _onPlay(a) {
    VILOS_PLAYERJS.on("play", () => a());
  }

  _onPause(a) {
    VILOS_PLAYERJS.on("pause", () => a());
  }

  _onSeek(a) {
    VILOS_PLAYERJS.on("timeupdate", (e) => {
      let previousSeek = this.previousSeek;
      this.previousSeek = e.seconds;
      if (Math.abs(e.seconds - previousSeek) < 0.5) return;
      a(e.seconds, e);
    });
  }

  async _getTime() {
    return await new Promise((resolve) => {
      VILOS_PLAYERJS.getCurrentTime(resolve);
    });
  }

  async _isPlay() {
    return await new Promise((resolve) => {
      VILOS_PLAYERJS.getPaused((paused) => resolve(paused === false));
    });
  }

  _seekTo(time) {
    VILOS_PLAYERJS.setCurrentTime(time);
  }

  _setState(state) {
    if (state) VILOS_PLAYERJS.play();
    else VILOS_PLAYERJS.pause();
  }

  _playerExist() {
    return typeof VILOS_PLAYERJS === "object";
  }
}
