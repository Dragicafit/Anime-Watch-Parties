import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundUtils } from "./backgroundUtils";

export class BackgroundSync {
  private clientScript: ClientScript;
  private backgroundUtils: BackgroundUtils;

  constructor(clientScript: ClientScript, backgroundUtils: BackgroundUtils) {
    this.clientScript = clientScript;
    this.backgroundUtils = backgroundUtils;
  }

  askVideo(clientTab: ClientTab): void {
    console.log("ask video");

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) return;

    const tabId = clientTab.getTabId();

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.changeVideoServer(clientTab, tab);
      })
      .catch(this.clientScript!.clientUtils.reportError);
  }

  askState(clientTab: ClientTab): void {
    console.log("ask state");

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: "askState",
      })
      .catch(this.clientScript.clientUtils.reportError);
  }

  changeVideoServer(clientTab: ClientTab, tab: browser.tabs.Tab): void {
    this.backgroundUtils.parseUrlTab(tab).then((url) => {
      if (url == null) return;
      this.clientScript.clientSync.changeVideoServer(clientTab, url);
    });
  }

  changeStateServer(clientTab: ClientTab, time: number, state: boolean) {
    this.clientScript.clientSync.changeStateServer(clientTab, time, state);
  }
}
