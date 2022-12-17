import { ClientScript } from "../../client-new/clientScript";
import { PlayerContext } from "./playerContext";

export class PlayerSync {
  tabContext: PlayerContext;
  clientScript: ClientScript;

  constructor(clientScript: ClientScript, tabContext: PlayerContext) {
    this.clientScript = clientScript;
    this.tabContext = tabContext;
  }

  syncClient(): void {
    console.log("sync client");

    this.clientScript.clientSync.syncClient(this.tabContext.clientTab);
  }

  sendState(time: number, state: boolean): void {
    console.log("send state", time, state);

    this.clientScript.clientSync.changeStateServer(
      this.tabContext.clientTab,
      time,
      state
    );
  }
}
