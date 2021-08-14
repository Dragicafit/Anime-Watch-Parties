import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class VilosplayerSetup extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    super("vilosplayer", tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  _onPlay(callback: (...events: any[]) => void): void {
    VILOS_PLAYERJS.on("play", () => {
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

  _onPause(callback: (...events: any[]) => void): void {
    VILOS_PLAYERJS.on("pause", () => {
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

  _onSeek(callback: (...events: any[]) => void): void {
    VILOS_PLAYERJS.on("timeupdate", (e) => {
      if (this.tabContext.window.document.hidden) {
        return;
      }
      if (
        !this.preventCallIfTriggered.has("seek") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("seek")! >
          200
      ) {
        let previousSeek = this.previousSeek;
        this.previousSeek = e.seconds;
        if (Math.abs(e.seconds - previousSeek) < 0.5) return;
        callback(e.seconds, e);
      }
    });
  }

  override _getTime() {
    return new Promise((resolve) => {
      VILOS_PLAYERJS.getCurrentTime(resolve);
    });
  }

  override _isPlay() {
    return new Promise((resolve) => {
      VILOS_PLAYERJS.getPaused((paused) => resolve(paused === false));
    });
  }

  _seekTo(time: number) {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    VILOS_PLAYERJS.setCurrentTime(time);
  }

  _setState(state: boolean) {
    if (state) {
      this.preventCallIfTriggered.set(
        "play",
        this.tabContext.performance.now()
      );
      VILOS_PLAYERJS.play();
    } else {
      this.preventCallIfTriggered.set(
        "pause",
        this.tabContext.performance.now()
      );
      VILOS_PLAYERJS.pause();
    }
  }

  override playerExist() {
    return typeof VILOS_PLAYERJS === "object";
  }
}
