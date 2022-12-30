import browser from "webextension-polyfill";
import { AWP_TOKEN } from "../../background-scripts/backgroundConst";
import { ClientListener } from "../../client-new/clientListener";
import { ClientRoom } from "../../client-new/clientRoom";
import { ClientTab } from "../../client-new/clientTab";
import { PopupScript } from "./popupScript";

export class PopupListener implements ClientListener {
  private popupScript: PopupScript;

  constructor(popupScript: PopupScript) {
    this.popupScript = popupScript;
  }

  askVideoListener(clientTab: ClientTab): void {}

  askStateListener(clientTab: ClientTab): void {}

  changeStateClientTabListener(clientTab: ClientTab): void {}

  changeVideoClientTabListener(clientTab: ClientTab): void {}

  changeNameClientTabListener(clientTab: ClientTab): void {}

  createMessageClientTabListener(clientTab: ClientTab): void {}

  changeNameClientListener(name: string): void {}

  changeHostClientTabListener(clientTab: ClientTab): void {
    this.popupScript.popupEvents.sendInfo(clientTab);
  }

  changeOnlineUsersClientTabListener(clientTab: ClientTab): void {
    this.popupScript.popupEvents.sendInfo(clientTab);
  }

  deletedTabListener(tabId: number): void {}

  createdRoomListener(clientRoom: ClientRoom): void {}

  modifiedRoomListener(clientRoom: ClientRoom): void {}

  deletedRoomListener(roomnum: string): void {}

  joinedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom) {
    this.popupScript.popupEvents.sendInfo(clientTab);

    this.popupScript.popupUtils.changeIcon(clientTab);

    this.popupScript.popupUtils.insertScript(clientTab);
  }

  leavedRoomListener(clientTab: ClientTab) {
    this.popupScript.popupEvents.sendInfo(clientTab);
  }

  async getToken(): Promise<string | null> {
    const value = await browser.storage.local.get(AWP_TOKEN);
    return value["AWP-token"];
  }

  setToken(token: string) {
    browser.storage.local.set({ [AWP_TOKEN]: token });
  }
}
