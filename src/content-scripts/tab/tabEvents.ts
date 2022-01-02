import { ClientRoomSimplier } from "../../client/clientRoom";
import { ClientContextSimplier } from "./../../client/clientContext";
import { TabContext } from "./tabContext";
import { TabSync } from "./tabSync";

export class TabEvents {
  tabContext: TabContext;
  tabSync: TabSync;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    this.tabContext = tabContext;
    this.tabSync = tabSync;
  }

  sendInfo(
    clientRoom: ClientRoomSimplier,
    clientContext: ClientContextSimplier
  ): void {
    console.log("send info", clientRoom, clientContext);

    if (clientRoom.roomnum != null) {
      this.tabContext.tabRoom.roomnum = clientRoom.roomnum;
    }
    if (clientRoom.host != null) {
      this.tabContext.tabRoom.host = clientRoom.host;
    }
    if (clientContext.name != null) {
      this.tabContext.name = clientContext.name;
    }
    this.tabContext.tabRoom.messages = clientRoom.messages;
    this.tabContext.embed!.update();
  }
}
