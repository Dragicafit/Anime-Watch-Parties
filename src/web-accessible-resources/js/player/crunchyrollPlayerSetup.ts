import { PlayerContext } from "../playerContext";
import { PlayerScript } from "../playerScript";
import { Html5Player } from "./html5Player";

export class CrunchyrollPlayerSetup extends Html5Player {
  public constructor(tabContext: PlayerContext, playerScript: PlayerScript) {
    super("Crunchyroll Player", tabContext, playerScript);
  }

  protected override player() {
    return <any>player0;
  }
}
