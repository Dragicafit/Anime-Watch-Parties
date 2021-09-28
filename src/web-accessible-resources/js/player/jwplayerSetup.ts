import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class JwplayerSetup extends AwpplayerSetup {
  private previousSeek: number;

  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("jwplayer", tabContext, tabSync);
    this.previousSeek = 0;
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
        callback(e);
      }
    });
  }

  protected override _onPause(callback: (...events: any[]) => void): void {
    this.player().on("pause", (e) => {
      callback(e);
    });
  }

  protected override _onSeek(callback: (...events: any[]) => void): void {
    this.player().on("seek", (e) => {
      if (this.tabContext.window.document.hidden) {
        return;
      }
      let previousSeek = this.previousSeek;
      this.previousSeek = e.offset;
      if (Math.abs(e.offset - previousSeek) < 0.5) return;
      callback(e.offset, e);
    });
  }

  protected override _getTime(): Promise<number> {
    return Promise.resolve(this.player().getPosition());
  }

  protected override _isPlay(): Promise<boolean> {
    return Promise.resolve(this.player().getState() === "playing");
  }

  protected override _seekTo(time: number): void {
    this.player().seek(time);
  }

  protected override _setState(state: boolean): void {
    if (state) {
      this.player().play();
    } else {
      this.player().pause();
    }
  }

  protected override _playerExist(): boolean {
    return typeof this.player().play === "function";
  }
}
