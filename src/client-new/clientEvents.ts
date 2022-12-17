import {
  Data,
  eventsServerReceive,
  IoCallback,
  SupportedSite,
} from "../server/io/ioConst";
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

    this.clientContext.socket.emit(eventsServerReceive.CREATE_ROOM, <
      IoCallback
    >((err, data) => this.joinedRoom(err, data, clientTab)));
  }

  joinRoom(clientTab: ClientTab, roomnum: string) {
    console.log(...this.saveLog("join room", roomnum, "from tab", clientTab));

    this.clientContext.socket.emit(
      eventsServerReceive.JOIN_ROOM,
      { roomnum: roomnum },
      <IoCallback>((err, data) => this.joinedRoom(err, data, clientTab))
    );
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
    if (data.messages != null) {
      this.changeMessagesClient(clientRoom, data.messages);
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
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.changeVideoClientTabListener(
        clientRoom.clientTab
      );
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
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.changeStateClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  changeOnlineUsersClient(clientRoom: ClientRoom, onlineUsers: number) {
    console.log(...this.saveLog("change online users client", onlineUsers));

    clientRoom.onlineUsers = onlineUsers;
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.changeOnlineUsersClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  changeHostClient(clientRoom: ClientRoom, host: boolean) {
    console.log(...this.saveLog("change host client", host));

    clientRoom.host = host;
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.changeHostClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  createMessageClient(clientRoom: ClientRoom, sender: string, message: string) {
    console.log(...this.saveLog("create message client", sender, message));

    clientRoom.messages.push({
      sender: sender,
      message: message,
    });
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.createMessageClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  changeMessagesClient(
    clientRoom: ClientRoom,
    messages: { sender: string; message: string }[]
  ) {
    console.log(...this.saveLog("change message client", messages));

    clientRoom.messages = messages;
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.createMessageClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  changeNameClient(clientRoom: ClientRoom, name: string | null) {
    console.log(
      ...this.saveLog("change name client", {
        name: name,
      })
    );

    this.clientContext.name = name!;
    if (clientRoom.clientTab) {
      this.clientContext.clientListener.changeNameClientTabListener(
        clientRoom.clientTab
      );
    }
  }

  private saveLog(...logs: any[]) {
    return this.clientUtils.saveLog(...logs);
  }
}
