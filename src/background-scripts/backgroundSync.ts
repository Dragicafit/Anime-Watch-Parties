import browser from "webextension-polyfill";
import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { SupportedSite } from "../server/io/ioConst";
import { eventsBackgroundSend } from "./backgroundConst";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundSync {
  private clientScript: ClientScript;
  private backgroundScript: BackgroundScript;

  constructor(clientScript: ClientScript, backgroundScript: BackgroundScript) {
    this.clientScript = clientScript;
    this.backgroundScript = backgroundScript;
  }

  askVideo(clientTab: ClientTab): void {
    console.log(...this.saveLog("ask video", clientTab));

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) return;

    const tabId = clientTab.getTabId();

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.changeVideoServer(clientTab, tab);
      })
      .catch(() => {});
  }

  askState(clientTab: ClientTab): void {
    console.log(...this.saveLog("ask state", clientTab));

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: eventsBackgroundSend.ASK_STATE,
      })
      .catch(() => {});
  }

  changeVideoServer(clientTab: ClientTab, tab: browser.Tabs.Tab): void {
    console.log(...this.saveLog("change video server", clientTab, tab));

    this.backgroundScript.backgroundUtils.parseUrlTab(tab).then((url) => {
      if (url == null || url.site === "awp") return;
      const url2: {
        videoId: string;
        site: SupportedSite;
        location?: string;
      } = { videoId: url.videoId!, site: url.site, location: url.location };
      this.clientScript.clientSync.changeVideoServer(clientTab, url2);
      this.backgroundScript.backgroundSync.sendInfo(clientTab);
    });
  }

  changeStateServer(clientTab: ClientTab, time: number, state: boolean) {
    console.log(
      ...this.saveLog("change state server", clientTab, {
        time: time,
        state: state,
      })
    );

    this.clientScript.clientSync.changeStateServer(clientTab, time, state);
    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeNameServer(name: string) {
    console.log(
      ...this.saveLog("change name server", {
        name: name,
      })
    );

    this.clientScript.clientSync.changeNameServer(name);
  }

  createMessageServer(clientTab: ClientTab, message: string) {
    console.log(
      ...this.saveLog("create message server", clientTab, {
        message: message,
      })
    );

    this.clientScript.clientSync.createMessageServer(clientTab, message);
    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  sendInfo(clientTab: ClientTab) {
    console.log(...this.saveLog("send info", clientTab));

    browser.runtime
      .sendMessage({
        command: eventsBackgroundSend.SEND_INFO,
        clientContext: this.clientScript.clientContext.simplify(),
      })
      .catch(() => {});

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    browser.tabs
      .sendMessage(clientTab.getTabId(), {
        command: eventsBackgroundSend.SEND_INFO,
        clientContext: this.clientScript.clientContext.simplify(),
        clientRoom: clientRoom.simplify(),
        clientTab: clientTab.simplify(),
      })
      .catch(() => {});

    this.backgroundScript.discordScript.discordSocket.sendInfo(
      clientRoom,
      clientTab.getTabId()
    );
  }

  sendActualUrl(clientTab: ClientTab, tab: browser.Tabs.Tab) {
    console.log(...this.saveLog("send actual url", clientTab));

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    this.backgroundScript.backgroundUtils.parseUrlTab(tab).then((actualUrl) => {
      browser.tabs
        .sendMessage(clientTab.getTabId(), {
          command: eventsBackgroundSend.SEND_ACTUAL_URL,
          actualUrl: actualUrl,
        })
        .catch(() => {});
    });
  }

  private saveLog(...logs: any[]) {
    return this.clientScript.clientUtils.saveLog(...logs);
  }
}
