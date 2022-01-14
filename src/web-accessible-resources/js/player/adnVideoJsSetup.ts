import { PlayerContext } from "../playerContext";
import { PlayerSync } from "../playerSync";
import { VideoJsSetup } from "./videoJsSetup";

export class AdnVideoJsSetup extends VideoJsSetup {
  public constructor(tabContext: PlayerContext, tabSync: PlayerSync) {
    super("AdnVideoJs", tabContext, tabSync);
  }

  protected override player() {
    return videojs.getPlayers()["adn-video-js"];
  }
}
