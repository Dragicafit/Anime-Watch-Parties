class vilosplayerSetup extends playerSetup {
  previousSeek = 0;

  _onPlay() {
    VILOS_PLAYERJS.on("play", async () => {
      console.log("vilosplayer playing");
      if (!host) return syncClient();
      changeState(await this.getTime(), true);
    });
  }

  _onPause() {
    VILOS_PLAYERJS.on("pause", async () => {
      console.log("vilosplayer pausing");
      if (!host) return;
      changeState(await this.getTime(), false);
    });
  }

  _onSeek() {
    VILOS_PLAYERJS.on("timeupdate", async (e) => {
      let previousSeek = this.previousSeek;
      this.previousSeek = e.seconds;
      if (Math.abs(e.seconds - previousSeek) < 0.5) return;
      console.log("vilosplayer seeking", e);
      if (!host) return;
      changeState(e.seconds, await this.isPlay());
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
