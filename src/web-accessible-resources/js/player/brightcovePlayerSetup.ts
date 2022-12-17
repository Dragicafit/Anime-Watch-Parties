import { PlayerContext } from "../playerContext";
import { PlayerScript } from "../playerScript";
import { VideoJsSetup } from "./videoJsSetup";

export class BrightcovePlayerSetup extends VideoJsSetup {
  public constructor(tabContext: PlayerContext, playerScript: PlayerScript) {
    super("BrightcovePlayer", tabContext, playerScript);
  }

  protected override player() {
    return videojs.getPlayer("brightcove-player");
  }
}
