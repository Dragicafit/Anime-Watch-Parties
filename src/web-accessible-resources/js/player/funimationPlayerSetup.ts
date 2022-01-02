import { PlayerContext } from "../playerContext";
import { PlayerSync } from "../playerSync";
import { Html5Player } from "./html5Player";

export class FunimationPlayerSetup extends Html5Player {
  public constructor(tabContext: PlayerContext, tabSync: PlayerSync) {
    super("Funimation Player", tabContext, tabSync);
  }

  protected override player() {
    return <any>vjs_video_3_html5_api;
  }
}
