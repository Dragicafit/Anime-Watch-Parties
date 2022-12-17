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

    this.clientUtils.emit(eventsServerReceive.CREATE_ROOM, <IoCallback>(
      ((err, data) => this.joinedRoom(err, data, clientTab))
    ));
  }

  joinRoom(clientTab: ClientTab, roomnum: string) {
    console.log(...this.saveLog("join room", roomnum, "from tab", clientTab));

    this.clientUtils.emit(eventsServerReceive.JOIN_ROOM, { roomnum: roomnum }, <
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
    this.clientContext.clientListener.changeVideoClientTabListener(
      clientRoom.getClientTab()
    );
  }

  changeStateClient(clientRoom: ClientRoom, time: number, state: boolean) {
    console.log(
      ...this.saveLog("change state client", {
        time: time,
        state: state,
      })
    );

    clientRoom.updateState(state, time);
    this.clientContext.clientListener.changeStateClientTabListener(
      clientRoom.getClientTab()
    );
  }

  changeOnlineUsersClient(clientRoom: ClientRoom, onlineUsers: number) {
    console.log(...this.saveLog("change online users client", onlineUsers));

    clientRoom.onlineUsers = onlineUsers;
    this.clientContext.clientListener.changeOnlineUsersClientTabListener(
      clientRoom.getClientTab()
    );
  }

  changeHostClient(clientRoom: ClientRoom, host: boolean) {
    console.log(...this.saveLog("change host client", host));

    clientRoom.host = host;
    this.clientContext.clientListener.changeHostClientTabListener(
      clientRoom.getClientTab()
    );
  }

  createMessageClient(clientRoom: ClientRoom, sender: string, message: string) {
    console.log(...this.saveLog("create message client", sender, message));

    clientRoom.messages.push({
      sender: sender,
      message: message,
    });
    this.clientContext.clientListener.createMessageClientTabListener(
      clientRoom.getClientTab()
    );
  }

  changeMessagesClient(
    clientRoom: ClientRoom,
    messages: { sender: string; message: string }[]
  ) {
    console.log(...this.saveLog("change message client", messages));

    clientRoom.messages = messages;
    this.clientContext.clientListener.createMessageClientTabListener(
      clientRoom.getClientTab()
    );
  }

  changeNameClient(name: string | null) {
    console.log(
      ...this.saveLog("change name client", {
        name: name,
      })
    );

    this.clientContext.name = name!;
    if (this.clientContext.clientRoom) {
      this.clientContext.clientListener.changeNameClientTabListener(
        this.clientContext.clientRoom.getClientTab()
      );
    }
  }

  private saveLog(...logs: any[]) {
    return this.clientUtils.saveLog(...logs);
  }
}
