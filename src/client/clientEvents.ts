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
    console.log(`create from tab ${clientTab}`);

    this.clientContext.socket.emit("createRoom", <IoCallback>(
      ((err, data) => this.joinedRoom(err, data, clientTab))
    ));
  }

  joinRoom(clientTab: ClientTab, roomnum: string) {
    console.log(`join room ${roomnum} from tab ${clientTab.getTabId()}`);

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
      return console.log(err);
    }
    if (data == null) return;

    this.leaveOldRoom(clientTab, data.roomnum!);

    const clientRoom = this.clientUtils.joinRoom(clientTab, data.roomnum!);

    this.changeHostClient(clientRoom, data.host!);
    this.changeOnlineUsersClient(clientRoom, data.onlineUsers!);
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

    if (clientTab.getHost()) {
      console.log("You are the new host!");
    }
    console.log(`send room number after joinRoom ${clientTab.getRoomnum()}`);
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
    console.log(`leave room`);

    const clientRoom = clientTab.getClientRoom();
    if (clientRoom == null) {
      return;
    }

    const roomnum = clientRoom.roomnum;
    this.clientUtils.leaveRoom(clientTab);
  }

  changeVideoClient(
    clientRoom: ClientRoom,
    url: {
      site: string;
      location: string | undefined;
      videoId: string;
    }
  ) {
    console.log("change video client", url);

    clientRoom.updateVideo(url);
    for (const [tabId, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeVideoClientTabListener(clientTab);
    }
  }

  changeStateClient(clientRoom: ClientRoom, time: number, state: boolean) {
    console.log("change state client", { time: time, state: state });

    clientRoom.updateState(state, time);
    for (const [tabId, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeStateClientTabListener(clientTab);
    }
  }

  changeOnlineUsersClient(clientRoom: ClientRoom, onlineUsers: number) {
    console.log("change onlineUsers:", onlineUsers);

    clientRoom.onlineUsers = onlineUsers;
    for (const [tabId, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeOnlineUsersClientTabListener(
        clientTab
      );
    }
  }

  changeHostClient(clientRoom: ClientRoom, host: boolean) {
    console.log("change host", host);

    clientRoom.host = host;
    for (const [tabId, clientTab] of clientRoom.clientTabs) {
      this.clientContext.clientListener.changeHostClientTabListener(clientTab);
    }
  }
}
