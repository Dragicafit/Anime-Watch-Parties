import { PlayerContext } from "../playerContext";
import { PlayerSync } from "../playerSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class VideoJsSetup extends AwpplayerSetup {
  private previousSeek: number;

  public constructor(
    name: string,
    tabContext: PlayerContext,
    tabSync: PlayerSync
  ) {
    super(name, tabContext, tabSync);
    this.previousSeek = 0;
  }

  protected override player() {
    return videojs.getPlayers()["player"];
  }

  protected override _onPlay(callback: (...events: any[]) => void): void {
    this.player().on("play", (e: any) => {
      callback(e);
    });
  }

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().on("pause", (e: any) => {
      callback(e);
    });
  }

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().on("timeupdate", (e: any) => {
      if (
        this.tabContext.window.document.hidden ||
        e.manuallyTriggered !== true
      ) {
        return;
      }
      let oldPreviousSeek = this.previousSeek;
      this.previousSeek = this.player().currentTime();
      if (Math.abs(this.previousSeek - oldPreviousSeek) < 0.5) return;
      callback(this.previousSeek, e);
    });
  }

  protected override _getTime(): Promise<number> {
    return Promise.resolve(this.player().currentTime());
  }

  protected override _isPlay(): Promise<boolean> {
    return Promise.resolve(!this.player().paused());
  }

  protected override _seekTo(time: number): void {
    this.player().currentTime(time);
  }

  protected override _setState(state: boolean): void {
    if (state) {
      this.player().play();
    } else {
      this.player().pause();
    }
  }

  protected override _playerExist(): boolean {
    return this.player().hasStarted_ != null;
  }
}
