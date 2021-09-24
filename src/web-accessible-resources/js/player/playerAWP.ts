import { AdnVideoJsSetup } from "./adnVideoJsSetup";
import { AwpPlayerInterface } from "./awpPlayerInterface";
import { BrightcovePlayerSetup } from "./brightcovePlayerSetup";
import { FunimationPlayerSetup } from "./funimationPlayerSetup";
import { JwplayerSetup } from "./jwplayerSetup";
import { NonExistantSetup } from "./nonExistantSetup";
import { VilosplayerSetup } from "./vilosplayerSetup";

export class PlayerAWP implements AwpPlayerInterface {
  private jwplayer: JwplayerSetup;
  private vilosplayer: VilosplayerSetup;
  private brightcovePlayer: BrightcovePlayerSetup;
  private funimationPlayer: FunimationPlayerSetup;
  private adnVideoJs: AdnVideoJsSetup;
  private nonExistant: NonExistantSetup;

  public constructor(
    jwplayer: JwplayerSetup,
    vilosplayer: VilosplayerSetup,
    brightcovePlayer: BrightcovePlayerSetup,
    funimationPlayer: FunimationPlayerSetup,
    adnVideoJs: AdnVideoJsSetup,
    nonExistant: NonExistantSetup
  ) {
    this.jwplayer = jwplayer;
    this.vilosplayer = vilosplayer;
    this.brightcovePlayer = brightcovePlayer;
    this.funimationPlayer = funimationPlayer;
    this.adnVideoJs = adnVideoJs;
    this.nonExistant = nonExistant;
  }

  private getAwpplayer(): AwpPlayerInterface {
    if (this.jwplayer.playerExist()) {
      return this.jwplayer;
    }
    if (this.vilosplayer.playerExist()) {
      return this.vilosplayer;
    }
    if (this.brightcovePlayer.playerExist()) {
      return this.brightcovePlayer;
    }
    if (this.funimationPlayer.playerExist()) {
      return this.funimationPlayer;
    }
    if (this.adnVideoJs.playerExist()) {
      return this.adnVideoJs;
    }
    return this.nonExistant;
  }

  onPlay() {
    return this.getAwpplayer().onPlay();
  }

  onPause() {
    return this.getAwpplayer().onPause();
  }

  onSeek() {
    return this.getAwpplayer().onSeek();
  }

  getTime() {
    return this.getAwpplayer().getTime();
  }

  isPlay() {
    return this.getAwpplayer().isPlay();
  }

  seekTo(time: number) {
    return this.getAwpplayer().seekTo(time);
  }

  setState(state: boolean) {
    return this.getAwpplayer().setState(state);
  }

  playerExist() {
    return this.getAwpplayer().playerExist();
  }
}
