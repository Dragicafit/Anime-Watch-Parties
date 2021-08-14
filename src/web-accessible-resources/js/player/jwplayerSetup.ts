import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class JwplayerSetup extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    super("jwplayer", tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  _onPlay(callback: (...events: any[]) => void): void {
    jwplayer().on("play", (e) => {
      if (
        this.tabContext.tabRoom.host ||
        (e.playReason === "interaction" && (<any>e).reason === "playing")
      ) {
        if (
          !this.preventCallIfTriggered.has("play") ||
          this.tabContext.performance.now() -
            this.preventCallIfTriggered.get("play")! >
            200
        ) {
          callback(e);
        }
      }
    });
  }

  _onPause(callback: (...events: any[]) => void): void {
    jwplayer().on("pause", (e) => {
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
    jwplayer().on("seek", (e) => {
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
        this.previousSeek = e.offset;
        if (Math.abs(e.offset - previousSeek) < 0.5) return;
        callback(e.offset, e);
      }
    });
  }

  override _getTime() {
    return Promise.resolve(jwplayer().getPosition());
  }

  override _isPlay(): Promise<boolean> {
    return Promise.resolve(jwplayer().getState() === "playing");
  }

  _seekTo(time: number): void {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    jwplayer().seek(time);
  }

  _setState(state: boolean): void {
    if (state) {
      this.preventCallIfTriggered.set(
        "play",
        this.tabContext.performance.now()
      );
      jwplayer().play();
    } else {
      this.preventCallIfTriggered.set(
        "pause",
        this.tabContext.performance.now()
      );
      jwplayer().pause();
    }
  }

  override playerExist(): boolean {
    return typeof jwplayer === "function";
  }
}
