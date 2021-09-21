import { AdnVideoJsSetup } from "./adnVideoJsSetup";
import { AwpPlayerInterface } from "./awpPlayerInterface";
import { BrightcovePlayerSetup } from "./brightcovePlayerSetup";
import { JwplayerSetup } from "./jwplayerSetup";
import { VilosplayerSetup } from "./vilosplayerSetup";

export class PlayerAWP implements AwpPlayerInterface {
  private jwplayer: JwplayerSetup;
  private vilosplayer: VilosplayerSetup;
  private brightcovePlayer: BrightcovePlayerSetup;
  private adnVideoJs: AdnVideoJsSetup;

  constructor(
    jwplayer: JwplayerSetup,
    vilosplayer: VilosplayerSetup,
    brightcovePlayer: BrightcovePlayerSetup,
    adnVideoJs: AdnVideoJsSetup
  ) {
    this.jwplayer = jwplayer;
    this.vilosplayer = vilosplayer;
    this.brightcovePlayer = brightcovePlayer;
    this.adnVideoJs = adnVideoJs;
  }

  get awpplayer():
    | JwplayerSetup
    | VilosplayerSetup
    | BrightcovePlayerSetup
    | AdnVideoJsSetup
    | null {
    if (this.jwplayer?.playerExist()) {
      return this.jwplayer;
    }
    if (this.vilosplayer?.playerExist()) {
      return this.vilosplayer;
    }
    if (this.brightcovePlayer?.playerExist()) {
      return this.brightcovePlayer;
    }
    if (this.adnVideoJs?.playerExist()) {
      return this.adnVideoJs;
    }
    return null;
  }

  onPlay() {
    return this.awpplayer!.onPlay();
  }

  onPause() {
    return this.awpplayer!.onPause();
  }

  onSeek() {
    return this.awpplayer!.onSeek();
  }

  getTime() {
    return this.awpplayer!.getTime();
  }

  isPlay() {
    return this.awpplayer!.isPlay();
  }

  seekTo(time: number) {
    return this.awpplayer!.seekTo(time);
  }

  setState(state: boolean) {
    return this.awpplayer!.setState(state);
  }

  playerExist() {
    return this.awpplayer!.playerExist();
  }
}
