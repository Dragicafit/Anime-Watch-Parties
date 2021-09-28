import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";
import { Html5Player } from "./html5Player";

export class CrunchyrollPlayerSetup extends Html5Player {
  public constructor(tabContext: TabContext, tabSync: TabSync) {
    super("Crunchyroll Player", tabContext, tabSync);
  }

  protected override player() {
    return <any>player0;
  }
}
