import { ClientListener } from "../client/clientListener";
import { ClientRoom } from "../client/clientRoom";
import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { BackgroundEvent } from "./backgroundEvents";
import { BackgroundSync } from "./backgroundSync";
import { BackgroundUtils } from "./backgroundUtils";

export class BackgroundListener implements ClientListener {
  private clientScript: ClientScript | undefined;
  private backgroundEvent: BackgroundEvent | undefined;
  private backgroundSync: BackgroundSync | undefined;
  private backgroundUtils: BackgroundUtils | undefined;

  constructor() {}

  askVideoListener(clientTab: ClientTab): void {
    this.backgroundSync!.askVideo(clientTab);
  }

  askStateListener(clientTab: ClientTab): void {
    this.backgroundSync!.askState(clientTab);
  }

  changeStateClientTabListener(clientTab: ClientTab): void {
    this.backgroundEvent!.changeStateClientTab(clientTab);
  }

  changeVideoClientTabListener(clientTab: ClientTab) {
    this.backgroundEvent!.changeVideoClientTab(clientTab);
  }

  changeHostClientTabListener(clientTab: ClientTab): void {
    this.backgroundEvent!.changeHostClientTab(clientTab);
  }

  changeOnlineUsersClientTabListener(clientTab: ClientTab): void {
    this.backgroundEvent!.changeOnlineUsersClientTab(clientTab);
  }

  createdTabListener(clientTab: ClientTab) {}

  deletedTabListener(tabId: number): void {}

  createdRoomListener(clientRoom: ClientRoom): void {}

  modifiedRoomListener(clientRoom: ClientRoom): void {}

  deletedRoomListener(roomnum: string): void {}

  joinedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom) {
    const tabId = clientTab.getTabId();

    this.backgroundUtils!.changeIcon();

    browser.tabs
      .get(tabId)
      .then((tab) => {
        this.backgroundUtils!.insertScript(tab, tabId);
      })
      .catch(this.clientScript!.clientUtils.reportError);

    this.backgroundEvent!.changeOnlineUsersClientTab(clientTab);
    this.backgroundEvent!.changeHostClientTab(clientTab);
  }

  leavedRoomListener(clientTab: ClientTab) {
    this.backgroundUtils!.changeIcon();

    this.backgroundEvent!.changeOnlineUsersClientTab(clientTab);
    this.backgroundEvent!.changeHostClientTab(clientTab);
  }

  public setClientScript(value: ClientScript) {
    this.clientScript = value;
  }

  public setBackgroundEvent(value: BackgroundEvent | undefined) {
    this.backgroundEvent = value;
  }

  public setBackgroundSync(value: BackgroundSync | undefined) {
    this.backgroundSync = value;
  }

  public setBackgroundUtils(value: BackgroundUtils | undefined) {
    this.backgroundUtils = value;
  }
}
