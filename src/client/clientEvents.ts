import { SupportedSite } from "./../server/io/ioConst";
import { Data, IoCallback } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientRoom } from "./clientRoom";
import { ClientSync } from "./clientSync";
import { ClientTab } from "./clientTab";
import { ClientUtils } from "./clientUtils";

export class ClientEvent {
  clientContext: ClientContext;
  clientUtils: ClientUtils;
  clientSync: ClientSync;

  constructor(
    clientContext: ClientContext,
    clientUtils: ClientUtils,
    clientSync: ClientSync
  ) {
    this.clientContext = clientContext;
    this.clientUtils = clientUtils;
    this.clientSync = clientSync;
  }

  createRoom(clientTab: ClientTab) {
    console.log(...this.saveLog("create room from tab", clientTab));

    this.clientContext.socket.emit("createRoom", <IoCallback>(
      ((err, data) => this.joinedRoom(err, data, clientTab))
    ));
  }

  joinRoom(clientTab: ClientTab, roomnum: string) {
    console.log(...this.saveLog("join room", roomnum, "from tab", clientTab));

    this.clientContext.socket.emit("joinRoom", { roomnum: roomnum }, <
      IoCallback
    >((err, data) => this.joinedRoom(err, data, clientTab)));
  }

  private joinedRoom(
    err: string | null,
    data: Data | undefined,
    clientTab: ClientTab
  ): void {
    if (err != null) {
      return console.log(...this.saveLog(err));
    }
    if (data == null) return;
    console.log(...this.saveLog("joined room", data, "from tab", clientTab));

    this.leaveOldRoom(clientTab, data.roomnum!);

    const clientRoom = this.clientUtils.joinRoom(clientTab, data.roomnum!);

    if (data.host != null) {
      this.changeHostClient(clientRoom, data.host);
    }
    if (data.onlineUsers != null) {
      this.changeOnlineUsersClient(clientRoom, data.onlineUsers);
    }
    if (data.videoId != null) {
      this.changeVideoClient(clientRoom, {
        site: data.site!,
        location: data.location,
        videoId: data.videoId,
      });
    } else if (data.host) {
      this.clientContext.clientListener.askVideoListener(clientTab);
    }
    if (data.time != null && data.state != null) {
      this.changeStateClient(clientRoom, data.time, data.state);
    } else if (data.host) {
      this.clientContext.clientListener.askStateListener(clientTab);
    }
  }

  private leaveOldRoom(clientTab: ClientTab, roomnum: string) {
    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }
    if (clientRoom.roomnum !== roomnum) {
      this.leaveRoom(clientTab);
    }
  }

  leaveRoom(clientTab: ClientTab): void {
    console.log(...this.saveLog(`leave room`));

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    this.clientUtils.leaveRoom(clientTab);
  }

  changeVideoClient(
    clientRoom: ClientRoom,
    url: {
      videoId: string;
      site: SupportedSite;
      location?: string;
    }
  ) {
    console.log(...this.saveLog("change video client", url));

    clientRoom.updateVideo(url);
    for (const [, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeVideoClientTabListener(clientTab);
    }
  }

  changeStateClient(clientRoom: ClientRoom, time: number, state: boolean) {
    console.log(
      ...this.saveLog("change state client", {
        time: time,
        state: state,
      })
    );

    clientRoom.updateState(state, time);
    for (const [, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeStateClientTabListener(clientTab);
    }
  }

  changeOnlineUsersClient(clientRoom: ClientRoom, onlineUsers: number) {
    console.log(...this.saveLog("change online users client", onlineUsers));

    clientRoom.onlineUsers = onlineUsers;
    for (const [, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeOnlineUsersClientTabListener(
        clientTab
      );
    }
  }

  changeHostClient(clientRoom: ClientRoom, host: boolean) {
    console.log(...this.saveLog("change host client", host));

    clientRoom.host = host;
    for (const [, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeHostClientTabListener(clientTab);
    }
  }

  private saveLog(...logs: any[]) {
    return this.clientUtils.saveLog(...logs);
  }
}
