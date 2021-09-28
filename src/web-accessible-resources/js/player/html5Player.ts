import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export abstract class Html5Player extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  public constructor(name: string, tabContext: TabContext, tabSync: TabSync) {
    super(name, tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  protected override _onPlay(callback: (...events: any[]) => void): void {
    this.player().onplay = (e: any) => {
      if (
        !this.preventCallIfTriggered.has("play") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("play")! >
          200
      ) {
        callback(e);
      }
    };
  }

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().onpause = (e: any) => {
      if (
        !this.preventCallIfTriggered.has("pause") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("pause")! >
          200
      ) {
        callback(e);
      }
    };
  }

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().ontimeupdate = (e: any) => {
      if (this.tabContext.window.document.hidden) {
        return;
      }
      if (
        !this.preventCallIfTriggered.has("seek") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("seek")! >
          200
      ) {
        let oldPreviousSeek = this.previousSeek;
        this.previousSeek = this.player().currentTime;
        if (Math.abs(this.previousSeek - oldPreviousSeek) < 0.5) return;
        callback(this.previousSeek, e);
      }
    };
  }

  protected override _getTime(): Promise<number> {
    return Promise.resolve(this.player().currentTime);
  }

  protected override _isPlay(): Promise<boolean> {
    return Promise.resolve(this.player().paused === false);
  }

  protected override _seekTo(time: number): void {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    this.player().currentTime = time;
  }

  protected override _setState(state: boolean): void {
    if (state) {
      this.preventCallIfTriggered.set(
        "play",
        this.tabContext.performance.now()
      );
      this.player().play();
    } else {
      this.preventCallIfTriggered.set(
        "pause",
        this.tabContext.performance.now()
      );
      this.player().pause();
    }
  }
}
