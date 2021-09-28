"use strict";

import $ from "jquery";
import { AdnVideoJsSetup } from "./player/adnVideoJsSetup";
import { BrightcovePlayerSetup } from "./player/brightcovePlayerSetup";
import { CrunchyrollPlayerSetup } from "./player/crunchyrollPlayerSetup";
import { FunimationPlayerSetup } from "./player/funimationPlayerSetup";
import { JwplayerSetup } from "./player/jwplayerSetup";
import { NonExistantSetup } from "./player/nonExistantSetup";
import { PlayerAWP } from "./player/playerAWP";
import { VideoJsSetup } from "./player/videoJsSetup";
import { TabContext } from "./tabContext";
import { TabEvents } from "./tabEvents";
import { TabRoom } from "./tabRoom";
import { TabSync } from "./tabSync";
import tabTransmission from "./tabTransmission";

let tabContext = new TabContext(
  "https://localhost:4000",
  new TabRoom(),
  $,
  window,
  window.performance
);

let tabSync = new TabSync(tabContext);
tabContext.playerAWP = new PlayerAWP(
  new JwplayerSetup(tabContext, tabSync),
  new CrunchyrollPlayerSetup(tabContext, tabSync),
  new BrightcovePlayerSetup(tabContext, tabSync),
  new FunimationPlayerSetup(tabContext, tabSync),
  new AdnVideoJsSetup(tabContext, tabSync),
  new VideoJsSetup("VideoJs", tabContext, tabSync),
  new NonExistantSetup(tabContext, tabSync)
);
let tabEvents = new TabEvents(tabContext, tabSync);
tabTransmission.start(tabContext, tabEvents);
