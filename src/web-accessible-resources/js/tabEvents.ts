import { TabContext } from "./tabContext";
import { TabSync } from "./tabSync";

export class TabEvents {
  tabContext: TabContext;
  tabSync: TabSync;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    this.tabContext = tabContext;
    this.tabSync = tabSync;
  }

  changeStateClient(time: number, state: boolean) {
    console.log("change state client");

    setTimeout(() => {
      this.tabContext.playerAWP!.getTime().then((clientTime) => {
        console.log(`current time is: ${clientTime}`);
        console.log(`current time server is: ${time}`);
        console.log(`current state server is: ${state}`);

        this.tabContext.playerAWP!.setState(state);

        if (Math.abs(clientTime - time) > 0.2)
          this.tabContext.playerAWP!.seekTo(time);
      });
    }, this.tabContext.tabRoom.delay);
  }

  sendInfo(roomnum: string, host: boolean): void {
    console.log("send info");

    if (roomnum != null) this.tabContext.tabRoom.roomnum = roomnum;
    if (host != null) this.tabContext.tabRoom.host = host;
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
