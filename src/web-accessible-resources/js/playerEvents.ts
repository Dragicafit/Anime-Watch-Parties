import { ClientRoomSimplier } from "../../client/clientRoom";
import { PlayerContext } from "./playerContext";
import { PlayerSync } from "./playerSync";

export class PlayerEvents {
  tabContext: PlayerContext;
  tabSync: PlayerSync;

  constructor(tabContext: PlayerContext, tabSync: PlayerSync) {
    this.tabContext = tabContext;
    this.tabSync = tabSync;
  }

  changeStateClient(time: number, state: boolean) {
    console.log("change state client", { time: time, state: state });

    setTimeout(() => {
      this.tabContext.playerAWP!.getTime().then((clientTime) => {
        console.log("current time is:", clientTime);
        console.log("current time server is:", time);
        console.log("current state server is:", state);

        this.tabContext.playerAWP!.setState(state);

        if (Math.abs(clientTime - time) > 0.2)
          this.tabContext.playerAWP!.seekTo(time);
      });
    }, this.tabContext.tabRoom.delay);
  }

  sendInfo(clientRoom: ClientRoomSimplier): void {
    console.log("send info", clientRoom);

    this.tabContext.tabRoom.host = clientRoom.host;
  }

  askState() {
    console.log("ask state");

    this.tabContext.playerAWP!.getTime().then((time: number): void => {
      this.tabContext.playerAWP!.isPlay().then((state: boolean): void => {
        this.tabSync.sendState(time, state);
      });
    });
  }
}
