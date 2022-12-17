import io from "socket.io-client";
import { SERVER_URL } from "../../background-scripts/backgroundConst";
import { ClientScript } from "../../client-new/clientScript";
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
import { PlayerListener } from "./playerListener";
import { PlayerSync } from "./playerSync";

export class PlayerScript {
  private clientScript: ClientScript;

  playerSync: PlayerSync;
  playerEvents: PlayerEvents;

  public constructor() {
    const socket = io(SERVER_URL);
    const playerListener = new PlayerListener(this);
    let playerContext = new PlayerContext(
      socket,
      window.performance,
      playerListener,
      window
    );
    this.clientScript = new ClientScript(playerContext);

    this.playerSync = new PlayerSync(this.clientScript, playerContext);
    this.playerEvents = new PlayerEvents(playerContext, this);

    playerContext.playerAWP = new PlayerAWP(
      new JwplayerSetup(playerContext, this),
      new CrunchyrollPlayerSetup(playerContext, this),
      new BrightcovePlayerSetup(playerContext, this),
      new FunimationPlayerSetup(playerContext, this),
      new AdnVideoJsSetup(playerContext, this),
      new VideoJsSetup("VideoJs", playerContext, this),
      new NonExistantSetup(playerContext, this)
    );
  }
}

new PlayerScript();
