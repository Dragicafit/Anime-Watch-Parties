import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class BrightcovePlayerSetup extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    super("BrightcovePlayer", tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  player() {
    return player.videojs.getPlayer("brightcove-player");
  }

  _onPlay(callback: (...events: any[]) => void): void {
    this.player().on("play", (e: any) => {
      if (
        !this.preventCallIfTriggered.has("play") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("play")! >
          200
      ) {
        callback(e);
      }
    });
  }

  _onPause(callback: (...events: any[]) => void): void {
    this.player().on("pause", (e: any) => {
      if (
        !this.preventCallIfTriggered.has("pause") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("pause")! >
          200
      ) {
        callback(e);
      }
    });
  }

  _onSeek(callback: (...events: any[]) => void): void {
    this.player().on("timeupdate", (e: any) => {
      if (
        this.tabContext.window.document.hidden ||
        e.manuallyTriggered !== true
      ) {
        return;
      }
      if (
        !this.preventCallIfTriggered.has("seek") ||
        this.tabContext.performance.now() -
          this.preventCallIfTriggered.get("seek")! >
          200
      ) {
        let oldPreviousSeek = this.previousSeek;
        this.previousSeek = this.player().currentTime();
        if (Math.abs(this.previousSeek - oldPreviousSeek) < 0.5) return;
        callback(this.previousSeek, e);
      }
    });
  }

  override _getTime() {
    return Promise.resolve(this.player().currentTime());
  }

  override _isPlay() {
    return Promise.resolve(!this.player().paused());
  }

  _seekTo(time: number) {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    this.player().currentTime(time);
  }

  _setState(state: boolean) {
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

  override playerExist() {
    try {
      return player.videojs.getPlayer("brightcove-player") != null;
    } catch (e) {
      return false;
    }
  }
}
