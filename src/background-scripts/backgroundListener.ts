import browser from "webextension-polyfill";
import { ClientListener } from "../client/clientListener";
import { ClientRoom } from "../client/clientRoom";
import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundScript } from "./backgroundScript";

export class BackgroundListener implements ClientListener {
  private clientScript: ClientScript | undefined;
  private backgroundScript: BackgroundScript;

  constructor(backgroundScript: BackgroundScript) {
    this.backgroundScript = backgroundScript;
  }

  askVideoListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundSync.askVideo(clientTab);
  }

  askStateListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundSync.askState(clientTab);
  }

  changeStateClientTabListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundEvent.changeStateClientTab(clientTab);
  }

  changeVideoClientTabListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundEvent.changeVideoClientTab(clientTab);
  }

  createMessageClientTabListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundEvent.sendMessagesClientTab(clientTab);
  }

  changeHostClientTabListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  changeOnlineUsersClientTabListener(clientTab: ClientTab): void {
    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  createdTabListener(clientTab: ClientTab) {}

  deletedTabListener(tabId: number): void {}

  createdRoomListener(clientRoom: ClientRoom): void {}

  modifiedRoomListener(clientRoom: ClientRoom): void {}

  deletedRoomListener(roomnum: string): void {}

  joinedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom) {
    const tabId = clientTab.getTabId();

    this.backgroundScript.backgroundUtils.changeIcon();

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.backgroundScript.backgroundUtils.insertScript(tab, tabId);
      })
      .catch((error) => console.error(...this.saveError(error)));

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  leavedRoomListener(clientTab: ClientTab) {
    this.backgroundScript.backgroundUtils.changeIcon();

    this.backgroundScript.backgroundSync.sendInfo(clientTab);
  }

  public setClientScript(value: ClientScript) {
    this.clientScript = value;
  }

  private saveError(...errors: any[]) {
    return this.clientScript!.clientUtils.saveError(...errors);
  }
}
