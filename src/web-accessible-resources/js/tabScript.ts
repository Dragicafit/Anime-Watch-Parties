"use strict";

import $ from "jquery";
import { BrightcovePlayerSetup } from "./player/brightcovePlayerSetup";
import { JwplayerSetup } from "./player/jwplayerSetup";
import { PlayerAWP } from "./player/playerAWP";
import { VilosplayerSetup } from "./player/vilosplayerSetup";
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
  new VilosplayerSetup(tabContext, tabSync),
  new BrightcovePlayerSetup(tabContext, tabSync)
);
let tabEvents = new TabEvents(tabContext, tabSync);
tabTransmission.start(tabContext, tabEvents);
