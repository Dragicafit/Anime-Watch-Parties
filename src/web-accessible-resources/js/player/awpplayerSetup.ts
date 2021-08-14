import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpPlayerInterface } from "./awpPlayerInterface";

export abstract class AwpplayerSetup implements AwpPlayerInterface {
  name: string;
  tabContext: TabContext;
  tabSync: TabSync;

  constructor(name: string, tabContext: TabContext, tabSync: TabSync) {
    this.name = name;
    this.tabContext = tabContext;
    this.tabSync = tabSync;
    this._waitForExist();
  }

  abstract _onPlay(callback?: (...events: any[]) => void): void;
  abstract _onPause(callback?: (...events: any[]) => void): void;
  abstract _onSeek(callback?: (...events: any[]) => void): void;

  onPlay() {
    this._onPlay((e) => {
      console.log(`${this.name} playing`, e);
      if (!this.tabContext.tabRoom.host) return this.tabSync.syncClient();
      this.getTime().then((time) => this.tabSync.sendState(time, true));
    });
  }

  onPause() {
    this._onPause((e) => {
      console.log(`${this.name} pausing`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.getTime().then((time) => this.tabSync.sendState(time, false));
    });
  }

  onSeek() {
    this._onSeek((offset, e) => {
      console.log(`${this.name} seeking ${offset} sec`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.isPlay().then((state) => this.tabSync.sendState(offset, state));
    });
  }

  getTime() {
    if (!this.playerExist()) return Promise.resolve(0);
    return this._getTime();
  }
  _getTime(): Promise<any> {
    return Promise.reject(new Error("not initialized"));
  }

  isPlay() {
    if (!this.playerExist()) return Promise.resolve(false);
    return this._isPlay();
  }
  _isPlay(): Promise<any> {
    return Promise.reject(new Error("not initialized"));
  }

  seekTo(time: number) {
    if (!this.playerExist()) return;
    this._seekTo(time);
  }
  abstract _seekTo(time: number): void;

  setState(state: boolean) {
    if (!this.playerExist()) return;
    this._setState(state);
  }
  abstract _setState(state: boolean): void;

  playerExist() {
    return false;
  }

  _waitForExist(): void {
    if (!this.playerExist()) {
      setTimeout(this._waitForExist.bind(this), 500);
      return;
    }
    this.onPlay();
    this.onPause();
    this.onSeek();
  }
}

exports.AwpplayerSetup = AwpplayerSetup;
