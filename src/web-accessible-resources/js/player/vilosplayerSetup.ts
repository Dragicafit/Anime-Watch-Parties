import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class VilosplayerSetup extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("vilosplayer", tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  protected override player() {
    return VILOS_PLAYERJS;
  }

  protected override _onPlay(callback: (...events: any[]) => void): void {
    this.player().on("play", () => {
      if (
        !this.preventCallIfTriggered.has("play") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("play")! >
          200
      ) {
        callback();
      }
    });
  }

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().on("pause", () => {
      if (
        !this.preventCallIfTriggered.has("pause") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("pause")! >
          200
      ) {
        callback();
      }
    });
  }

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().on("timeupdate", (e) => {
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
        this.previousSeek = e.seconds;
        if (Math.abs(e.seconds - oldPreviousSeek) < 0.5) return;
        callback(e.seconds, e);
      }
    });
  }

  protected override _getTime(): Promise<number> {
    return new Promise((resolve) => {
      this.player().getCurrentTime(resolve);
    });
  }

  protected override _isPlay(): Promise<boolean> {
    return new Promise((resolve) => {
      this.player().getPaused((paused) => resolve(paused === false));
    });
  }

  protected override _seekTo(time: number): void {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    this.player().setCurrentTime(time);
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
