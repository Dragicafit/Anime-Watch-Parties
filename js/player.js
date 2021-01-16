class playerSetup {
  name = "";

  constructor(name) {
    this.name = name;
    this._waitForExist();
  }

  _onPlay(a) {}
  _onPause(a) {}
  _onSeek(a) {}

  onPlay() {
    this._onPlay(async (e) => {
      console.log(`${this.name} playing`, e);
      if (!host) return syncClient();
      changeState(await this.getTime(), true);
    });
  }

  onPause() {
    this._onPause(async (e) => {
      console.log(`${this.name} pausing`, e);
      if (!host) return;
      changeState(await this.getTime(), false);
    });
  }

  onSeek() {
    this._onSeek(async (offset, e) => {
      console.log(`${this.name} seeking ${offset} sec`, e);
      if (!host) return;
      changeState(offset, await this.isPlay());
    });
  }

  getTime() {
    if (!this._playerExist()) return 0;
    return this._getTime();
  }
  _getTime() {
    return 0;
  }

  isPlay() {
    if (!this._playerExist()) return false;
    return this._isPlay();
  }
  _isPlay() {
    return false;
  }

  seekTo(time) {
    if (!this._playerExist()) return;
    this._seekTo(time);
  }
  _seekTo(time) {}

  setState(state) {
    if (!this._playerExist()) return;
    this._setState(state);
  }
  _setState(state) {}

  _playerExist() {
    return false;
  }

  _waitForExist() {
    if (!this._playerExist())
      return setTimeout(this._waitForExist.bind(this), 500);

    this.onPlay();
    this.onPause();
    this.onSeek();
  }
}
