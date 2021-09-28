import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { Html5Player } from "./html5Player";

export class FunimationPlayerSetup extends Html5Player {
  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("Funimation Player", tabContext, tabSync);
  }

  protected override player() {
    return <any>vjs_video_3_html5_api;
  }
}
