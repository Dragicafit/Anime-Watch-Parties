import _ from "lodash";
import { ClientContextSimplier } from "../../client/clientContext";
import { ClientRoomSimplier } from "../../client/clientRoom";
import { SupportedSite } from "../../server/io/ioConst";
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

    this.tabContext.tabRoom.roomnum = clientRoom.roomnum;
    this.tabContext.tabRoom.host = clientRoom.host;
    this.tabContext.tabRoom.onlineUsers = clientRoom.onlineUsers;
    let scroll = !_.isEqual(
      this.tabContext.tabRoom.messages,
      clientRoom.messages
    );
    if (scroll) {
      this.tabContext.tabRoom.messages = clientRoom.messages;
    }

    this.tabContext.name = clientContext.name;

    this.tabContext.embed!.update(scroll);
  }

  sendActualUrl(
    actualUrl: {
      videoId?: string | undefined;
      site: SupportedSite | "awp";
      location?: string | undefined;
    } | null
  ) {
    console.log("send actual url", actualUrl);

    this.tabContext.embed!.showStudio(actualUrl);
  }
}
