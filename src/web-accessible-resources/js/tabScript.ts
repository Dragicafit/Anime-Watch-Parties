"use strict";

import { JwplayerSetup } from "./player/jwplayerSetup";
import { VilosplayerSetup } from "./player/vilosplayerSetup";
import $ from "jquery";
import jqueryUiBrowserify from "./jquery-ui-browserify";
import { TabContext } from "./tabContext";
import { TabSync } from "./tabSync";
import { TabEvents } from "./tabEvents";
import { TabRoom } from "./tabRoom";
import tabTransmission from "./tabTransmission";
import { PlayerAWP } from "./player/playerAWP";
import { BrightcovePlayerSetup } from "./player/brightcovePlayerSetup";

jqueryUiBrowserify($);

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
