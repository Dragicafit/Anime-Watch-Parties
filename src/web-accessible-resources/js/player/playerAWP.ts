import { AwpPlayerInterface } from "./awpPlayerInterface";
import { JwplayerSetup } from "./jwplayerSetup";
import { VilosplayerSetup } from "./vilosplayerSetup";

export class PlayerAWP implements AwpPlayerInterface {
  private jwplayer: JwplayerSetup;
  private vilosplayer: VilosplayerSetup;

  constructor(jwplayer: JwplayerSetup, vilosplayer: VilosplayerSetup) {
    this.jwplayer = jwplayer;
    this.vilosplayer = vilosplayer;
  }

  get awpplayer(): JwplayerSetup | VilosplayerSetup | void {
    if (this.jwplayer?.playerExist()) {
      return this.jwplayer;
    }
    if (this.vilosplayer?.playerExist()) {
      return this.vilosplayer;
    }
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
