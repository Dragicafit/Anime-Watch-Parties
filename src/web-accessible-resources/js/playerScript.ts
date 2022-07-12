import { AdnVideoJsSetup } from "./player/adnVideoJsSetup";
import { BrightcovePlayerSetup } from "./player/brightcovePlayerSetup";
import { CrunchyrollPlayerSetup } from "./player/crunchyrollPlayerSetup";
import { FunimationPlayerSetup } from "./player/funimationPlayerSetup";
import { JwplayerSetup } from "./player/jwplayerSetup";
import { NonExistantSetup } from "./player/nonExistantSetup";
import { PlayerAWP } from "./player/playerAWP";
import { VideoJsSetup } from "./player/videoJsSetup";
import { PlayerContext } from "./playerContext";
import { PlayerEvents } from "./playerEvents";
import { PlayerRoom } from "./playerRoom";
import { PlayerSync } from "./playerSync";
import tabTransmission from "./playerTransmission";

let tabContext = new PlayerContext(
  new PlayerRoom(),
  window,
  window.performance
);

let tabSync = new PlayerSync(tabContext);
tabContext.playerAWP = new PlayerAWP(
  new JwplayerSetup(tabContext, tabSync),
  new CrunchyrollPlayerSetup(tabContext, tabSync),
  new BrightcovePlayerSetup(tabContext, tabSync),
  new FunimationPlayerSetup(tabContext, tabSync),
  new AdnVideoJsSetup(tabContext, tabSync),
  new VideoJsSetup("VideoJs", tabContext, tabSync),
  new NonExistantSetup(tabContext, tabSync)
);
let tabEvents = new PlayerEvents(tabContext, tabSync);
tabTransmission.start(tabContext, tabEvents);
