import { AWP_TOKEN } from "../../background-scripts/backgroundConst";
import { ClientListener } from "../../client-new/clientListener";
import { ClientRoom } from "../../client-new/clientRoom";
import { ClientTab } from "../../client-new/clientTab";
import { PlayerScript } from "./playerScript";

export class PlayerListener implements ClientListener {
  private playerScript: PlayerScript;

  constructor(playerScript: PlayerScript) {
    this.playerScript = playerScript;
  }

  askVideoListener(clientTab: ClientTab): void {}

  askStateListener(clientTab: ClientTab): void {}

  changeStateClientTabListener(clientTab: ClientTab): void {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    this.playerScript.playerEvents.changeStateClient(
      clientRoom.getCurrTime(),
      clientRoom.getState()
    );
  }

  changeVideoClientTabListener(clientTab: ClientTab): void {}

  changeNameClientTabListener(clientTab: ClientTab): void {}

  createMessageClientTabListener(clientTab: ClientTab): void {}

  changeNameClientListener(name: string): void {}

  changeHostClientTabListener(clientTab: ClientTab): void {}

  changeOnlineUsersClientTabListener(clientTab: ClientTab): void {}

  deletedTabListener(tabId: number): void {}

  createdRoomListener(clientRoom: ClientRoom): void {}

  modifiedRoomListener(clientRoom: ClientRoom): void {}

  deletedRoomListener(roomnum: string): void {}

  joinedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom) {}

  leavedRoomListener(clientTab: ClientTab) {}

  tokenListener(): string | null {
    return localStorage.getItem(AWP_TOKEN);
  }
}
