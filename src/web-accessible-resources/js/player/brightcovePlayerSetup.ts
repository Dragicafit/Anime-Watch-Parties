import { PlayerContext } from "../playerContext";
import { PlayerSync } from "../playerSync";
import { VideoJsSetup } from "./videoJsSetup";

export class BrightcovePlayerSetup extends VideoJsSetup {
  public constructor(tabContext: PlayerContext, tabSync: PlayerSync) {
    super("BrightcovePlayer", tabContext, tabSync);
  }

  protected override player() {
    return videojs.getPlayer("brightcove-player");
  }
}
