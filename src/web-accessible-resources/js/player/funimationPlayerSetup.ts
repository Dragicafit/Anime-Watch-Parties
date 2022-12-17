import { PlayerContext } from "../playerContext";
import { PlayerScript } from "../playerScript";
import { Html5Player } from "./html5Player";

export class FunimationPlayerSetup extends Html5Player {
  public constructor(tabContext: PlayerContext, playerScript: PlayerScript) {
    super("Funimation Player", tabContext, playerScript);
  }

  protected override player() {
    return <any>vjs_video_3_html5_api;
  }
}
