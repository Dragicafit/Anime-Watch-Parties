import { TabContext } from "./tabContext";

export class TabSync {
  tabContext: TabContext;

  constructor(tabContext: TabContext) {
    this.tabContext = tabContext;
  }

  syncClient() {
    console.log("sync client");

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: "syncClient",
      },
      this.tabContext.window.location.origin
    );
  }

  sendState(time: number, state: boolean) {
    console.log("send state");

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: "sendState",
        state: state,
        time: time,
      },
      this.tabContext.window.location.origin
    );
  }
}
