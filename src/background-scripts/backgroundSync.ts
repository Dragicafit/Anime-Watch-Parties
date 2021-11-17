import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundSync {
  private clientScript: ClientScript;
  private backgroundScript: BackgroundScript;

  constructor(clientScript: ClientScript, backgroundScript: BackgroundScript) {
    this.clientScript = clientScript;
    this.backgroundScript = backgroundScript;
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
    this.backgroundScript.backgroundUtils.parseUrlTab(tab).then((url) => {
      if (url == null) return;
      this.clientScript.clientSync.changeVideoServer(clientTab, url);
    });
  }

  changeStateServer(clientTab: ClientTab, time: number, state: boolean) {
    this.clientScript.clientSync.changeStateServer(clientTab, time, state);
  }

  sendInfo(clientTab: ClientTab) {
    browser.runtime
      .sendMessage({
        command: "sendInfo",
        clientContext: this.clientScript.clientContext.simplify(),
      })
      .catch(this.clientScript.clientUtils.reportError);

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: "sendInfo",
        clientRoom: clientRoom.simplify(),
        clientTab: clientTab.simplify(),
      })
      .catch(this.clientScript.clientUtils.reportError);
  }
}
