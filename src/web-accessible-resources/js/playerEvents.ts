import { PlayerContext } from "./playerContext";
import { PlayerScript } from "./playerScript";
import { PlayerSync } from "./playerSync";

export class PlayerEvents {
  playerContext: PlayerContext;
  playerSync: PlayerSync;

  constructor(tabContext: PlayerContext, playerScript: PlayerScript) {
    this.playerContext = tabContext;
    this.playerSync = playerScript.playerSync;
  }

  changeStateClient(time: number, state: boolean) {
    console.log("change state client", { time: time, state: state });

    this.playerContext.playerAWP!.getTime().then((clientTime) => {
      console.log("current time is:", clientTime);
      console.log("current time server is:", time);
      console.log("current state server is:", state);

      this.playerContext.playerAWP!.setState(state);

      if (Math.abs(clientTime - time) > 0.2)
        this.playerContext.playerAWP!.seekTo(time);
    });
  }

  askState() {
    console.log("ask state");

    this.playerContext.playerAWP!.getTime().then((time: number): void => {
      this.playerContext.playerAWP!.isPlay().then((state: boolean): void => {
        this.playerSync.sendState(time, state);
      });
    });
  }
}
