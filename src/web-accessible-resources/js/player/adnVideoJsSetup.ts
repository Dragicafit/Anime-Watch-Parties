import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { VideoJsSetup } from "./videoJsSetup";

export class AdnVideoJsSetup extends VideoJsSetup {
  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("AdnVideoJs", tabContext, tabSync);
  }

  protected override player() {
    return videojs.getPlayers()["adn-video-js"];
  }
}
