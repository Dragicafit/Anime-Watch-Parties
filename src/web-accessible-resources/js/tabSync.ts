const { TabContext } = require("./tabContext");

class TabSync {
  /** @type {TabContext} */
  tabContext;

  /** @param {TabContext} tabContext */
  constructor(tabContext) {
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

  sendState(time, state) {
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

exports.TabSync = TabSync;
