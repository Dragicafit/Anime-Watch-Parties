import browser from "webextension-polyfill";
import { TabContext } from "./tabContext";

export class TabSync {
  tabContext: TabContext;

  constructor(tabContext: TabContext) {
    this.tabContext = tabContext;
  }

  syncClient(): void {
    console.log("sync client");

    this.tabContext.window.postMessage(
      {
        direction: "from-script-AWP",
        command: "syncClient",
      },
      this.tabContext.window.location.origin
    );
  }

  sendName(name: string): void {
    console.log("send name", name);

    browser.runtime.sendMessage({
      command: "sendName",
      name: name,
    });
  }

  createMessage(message: string): void {
    console.log("create message", message);

    browser.runtime.sendMessage({
      command: "createMessage",
      message: message,
    });
  }
}