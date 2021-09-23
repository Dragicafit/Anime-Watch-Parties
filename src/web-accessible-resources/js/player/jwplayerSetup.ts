import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class JwplayerSetup extends AwpplayerSetup {
  private previousSeek: number;
  private preventCallIfTriggered: Map<string, number>;

  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("jwplayer", tabContext, tabSync);
    this.previousSeek = 0;
    this.preventCallIfTriggered = new Map();
  }

  protected override player() {
    return jwplayer();
  }

  protected override _onPlay(callback: (...events: any[]) => void): void {
    this.player().on("play", (e) => {
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

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().on("pause", (e) => {
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

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().on("seek", (e) => {
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

  protected override _getTime(): Promise<number> {
    return Promise.resolve(this.player().getPosition());
  }

  protected override _isPlay(): Promise<boolean> {
    return Promise.resolve(this.player().getState() === "playing");
  }

  protected override _seekTo(time: number): void {
    this.preventCallIfTriggered.set("seek", this.tabContext.performance.now());
    this.player().seek(time);
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

  protected override _playerExist(): boolean {
    return typeof jwplayer().play === "function";
  }
}
