import { TabContext } from "./tabContext";
import { TabSync } from "./tabSync";

export class TabEvents {
  tabContext: TabContext;
  tabSync: TabSync;
  popupTwitch: Window | undefined;

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

  openPopupTwitch(roomnum: string): void {
    console.log("open popup twitch");

    if (this.popupTwitch == null || this.popupTwitch.closed) {
      this.popupTwitch = this.tabContext.window.open(
        `${this.tabContext.server}/auth/twitch`,
        "Twitch",
        "width=1024,height=600,scrollbars=yes"
      )!;
    } else {
      return this.popupTwitch.focus();
    }
    if (this.popupTwitch == null) return;

    this.tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !== this.popupTwitch ||
        event.origin !== this.tabContext.server ||
        event.data?.direction !== "from-popupTwitch-AWP"
      )
        return;
      if (event.data.command === "success") {
        this.popupTwitch.close();
        this.tabContext.window.postMessage(
          {
            direction: "from-script-AWP",
            command: "restartSocket",
            roomnum: roomnum,
          },
          this.tabContext.window.location.origin
        );
      }
    });
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
