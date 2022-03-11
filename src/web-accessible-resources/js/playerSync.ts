import { eventsBackgroundReceive } from "../../background-scripts/backgroundConst";
import { PlayerContext } from "./playerContext";

export class PlayerSync {
  tabContext: PlayerContext;

  constructor(tabContext: PlayerContext) {
    this.tabContext = tabContext;
  }

  syncClient(): void {
    console.log("sync client");

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: eventsBackgroundReceive.SYNC_CLIENT,
      },
      this.tabContext.window.location.origin
    );
  }

  sendState(time: number, state: boolean): void {
    console.log("send state", time, state);

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: eventsBackgroundReceive.SEND_STATE,
        state: state,
        time: time,
      },
      this.tabContext.window.location.origin
    );
  }
}
