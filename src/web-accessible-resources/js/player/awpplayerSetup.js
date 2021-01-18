class awpplayerSetup {
  name = "";

  constructor(name) {
    this.name = name;
    this._waitForExist();
  }

  _onPlay(a) {}
  _onPause(a) {}
  _onSeek(a) {}

  onPlay() {
    this._onPlay((e) => {
      console.log(`${this.name} playing`, e);
      if (!host) return syncClient();
      this.getTime().then((time) => sendState(time, true));
    });
  }

  onPause() {
    this._onPause((e) => {
      console.log(`${this.name} pausing`, e);
      if (!host) return;
      this.getTime().then((time) => sendState(time, false));
    });
  }

  onSeek() {
    this._onSeek((offset, e) => {
      console.log(`${this.name} seeking ${offset} sec`, e);
      if (!host) return;
      this.isPlay().then((state) => sendState(offset, state));
    });
  }

  getTime() {
    if (!this._playerExist()) return Promise.resolve(0);
    return this._getTime();
  }
  _getTime() {
    return Promise.reject(new Error("not initialized"));
  }

  isPlay() {
    if (!this._playerExist()) return Promise.resolve(false);
    return this._isPlay();
  }
  _isPlay() {
    return Promise.reject(new Error("not initialized"));
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
