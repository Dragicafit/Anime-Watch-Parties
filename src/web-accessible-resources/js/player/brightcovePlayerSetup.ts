import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { VideoJsSetup } from "./videoJsSetup";

export class BrightcovePlayerSetup extends VideoJsSetup {
  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("BrightcovePlayer", tabContext, tabSync);
  }

  protected override player() {
    return videojs.getPlayer("brightcove-player");
  }
}
