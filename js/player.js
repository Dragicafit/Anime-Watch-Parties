class playerSetup {
  constructor() {
    this._waitForExist();
  }

  _onPlay() {}
  _onPause() {}
  _onSeek() {}

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

    this._onPlay();
    this._onPause();
    this._onSeek();
  }
}
