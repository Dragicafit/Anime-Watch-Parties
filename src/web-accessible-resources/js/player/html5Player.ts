import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export abstract class Html5Player extends AwpplayerSetup {
  private previousSeek: number;

  public constructor(name: string, tabContext: TabContext, tabSync: TabSync) {
    super(name, tabContext, tabSync);
    this.previousSeek = 0;
  }

  protected override _onPlay(callback: (...events: any[]) => void): void {
    this.player().onplay = (e: any) => {
      callback(e);
    };
  }

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().onpause = (e: any) => {
      callback(e);
    };
  }

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().ontimeupdate = (e: any) => {
      if (this.tabContext.window.document.hidden) {
        return;
      }
      let oldPreviousSeek = this.previousSeek;
      this.previousSeek = this.player().currentTime;
      if (Math.abs(this.previousSeek - oldPreviousSeek) < 0.5) return;
      callback(this.previousSeek, e);
    };
  }

  protected override _getTime(): Promise<number> {
    return Promise.resolve(this.player().currentTime);
  }

  protected override _isPlay(): Promise<boolean> {
    return Promise.resolve(this.player().paused === false);
  }

  protected override _seekTo(time: number): void {
    this.player().currentTime = time;
  }

  protected override _setState(state: boolean): void {
    if (state) {
      this.player().play();
    } else {
      this.player().pause();
    }
  }
}
