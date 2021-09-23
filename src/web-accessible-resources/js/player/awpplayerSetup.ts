import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpPlayerInterface } from "./awpPlayerInterface";

export abstract class AwpplayerSetup implements AwpPlayerInterface {
  private name: string;
  protected tabContext: TabContext;
  protected tabSync: TabSync;

  public constructor(name: string, tabContext: TabContext, tabSync: TabSync) {
    this.name = name;
    this.tabContext = tabContext;
    this.tabSync = tabSync;
    this.waitForExist();
  }

  protected abstract player(): any;

  protected abstract _onPlay(callback?: (...events: any[]) => void): void;
  protected abstract _onPause(callback?: (...events: any[]) => void): void;
  protected abstract _onSeek(callback?: (...events: any[]) => void): void;
  protected abstract _getTime(): Promise<number>;
  protected abstract _isPlay(): Promise<boolean>;
  protected abstract _seekTo(time: number): void;
  protected abstract _setState(state: boolean): void;

  public onPlay(): void {
    this._onPlay((e) => {
      console.log(`${this.name} playing`, e);
      if (!this.tabContext.tabRoom.host) return this.tabSync.syncClient();
      this.getTime().then((time) => this.tabSync.sendState(time, true));
    });
  }

  public onPause(): void {
    this._onPause((e) => {
      console.log(`${this.name} pausing`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.getTime().then((time) => this.tabSync.sendState(time, false));
    });
  }

  public onSeek(): void {
    this._onSeek((offset, e) => {
      console.log(`${this.name} seeking ${offset} sec`, e);
      if (!this.tabContext.tabRoom.host) return;
      this.isPlay().then((state) => this.tabSync.sendState(offset, state));
    });
  }

  public getTime(): Promise<any> {
    if (!this.playerExist()) return Promise.resolve(0);
    return this._getTime();
  }

  public isPlay(): Promise<any> {
    if (!this.playerExist()) return Promise.resolve(false);
    return this._isPlay();
  }

  public seekTo(time: number): void {
    if (!this.playerExist()) return;
    this._seekTo(time);
  }

  public setState(state: boolean): void {
    if (!this.playerExist()) return;
    this._setState(state);
  }

  private waitForExist(): void {
    if (!this.playerExist()) {
      setTimeout(this.waitForExist.bind(this), 500);
      return;
    }
    this.onPlay();
    this.onPause();
    this.onSeek();
  }

  public playerExist(): boolean {
    try {
      return this._playerExist();
    } catch (e) {
      return false;
    }
  }

  protected _playerExist(): boolean {
    return this.player() != null;
  }
}
