import { PlayerContext } from "../playerContext";
import { PlayerSync } from "../playerSync";
import { Html5Player } from "./html5Player";

export class CrunchyrollPlayerSetup extends Html5Player {
  public constructor(tabContext: PlayerContext, tabSync: PlayerSync) {
    super("Crunchyroll Player", tabContext, tabSync);
  }

  protected override player() {
    return <any>player0;
  }
}
