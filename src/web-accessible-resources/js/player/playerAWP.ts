import { AdnVideoJsSetup } from "./adnVideoJsSetup";
import { AwpPlayerInterface } from "./awpPlayerInterface";
import { BrightcovePlayerSetup } from "./brightcovePlayerSetup";
import { CrunchyrollPlayerSetup } from "./crunchyrollPlayerSetup";
import { FunimationPlayerSetup } from "./funimationPlayerSetup";
import { JwplayerSetup } from "./jwplayerSetup";
import { NonExistantSetup } from "./nonExistantSetup";
import { VideoJsSetup } from "./videoJsSetup";

export class PlayerAWP implements AwpPlayerInterface {
  private jwplayer: JwplayerSetup;
  private crunchyrollPlayer: CrunchyrollPlayerSetup;
  private brightcovePlayer: BrightcovePlayerSetup;
  private funimationPlayer: FunimationPlayerSetup;
  private adnVideoJs: AdnVideoJsSetup;
  private videoJs: VideoJsSetup;
  private nonExistant: NonExistantSetup;

  public constructor(
    jwplayer: JwplayerSetup,
    crunchyrollPlayer: CrunchyrollPlayerSetup,
    brightcovePlayer: BrightcovePlayerSetup,
    funimationPlayer: FunimationPlayerSetup,
    adnVideoJs: AdnVideoJsSetup,
    videoJs: VideoJsSetup,
    nonExistant: NonExistantSetup
  ) {
    this.jwplayer = jwplayer;
    this.crunchyrollPlayer = crunchyrollPlayer;
    this.brightcovePlayer = brightcovePlayer;
    this.funimationPlayer = funimationPlayer;
    this.adnVideoJs = adnVideoJs;
    this.videoJs = videoJs;
    this.nonExistant = nonExistant;
  }

  private getAwpplayer(): AwpPlayerInterface {
    if (this.jwplayer.playerExist()) {
      return this.jwplayer;
    }
    if (this.crunchyrollPlayer.playerExist()) {
      return this.crunchyrollPlayer;
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
    if (this.videoJs.playerExist()) {
      return this.videoJs;
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
