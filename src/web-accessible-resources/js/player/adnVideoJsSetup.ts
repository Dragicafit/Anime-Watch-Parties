import { PlayerContext } from "../playerContext";
import { PlayerScript } from "../playerScript";
import { VideoJsSetup } from "./videoJsSetup";

export class AdnVideoJsSetup extends VideoJsSetup {
  public constructor(tabContext: PlayerContext, playerScript: PlayerScript) {
    super("AdnVideoJs", tabContext, playerScript);
  }

  protected override player() {
    return videojs.getPlayers()["adn-video-js"];
  }
}
