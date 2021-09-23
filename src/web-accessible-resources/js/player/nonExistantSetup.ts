import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { AwpplayerSetup } from "./awpplayerSetup";

export class NonExistantSetup extends AwpplayerSetup {
  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("non existant", tabContext, tabSync);
  }

  protected override player() {
    throw new Error("Method not implemented.");
  }

  protected override _onPlay(): void {
    throw new Error("Method not implemented.");
  }

  protected override _onPause(): void {
    throw new Error("Method not implemented.");
  }

  protected _onSeek(): void {
    throw new Error("Method not implemented.");
  }

  protected override _getTime(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  protected override _isPlay(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  protected override _seekTo(): void {
    throw new Error("Method not implemented.");
  }

  protected override _setState(): void {
    throw new Error("Method not implemented.");
  }

  protected override _playerExist(): boolean {
    return false;
  }
}
