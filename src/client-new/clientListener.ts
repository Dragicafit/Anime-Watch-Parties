import { ClientRoom } from "./clientRoom";
import { ClientTab } from "./clientTab";

export interface ClientListener {
  askVideoListener(clientTab: ClientTab): void;
  askStateListener(clientTab: ClientTab): void;

  changeStateClientTabListener(clientTab: ClientTab): void;
  changeVideoClientTabListener(clientTab: ClientTab): void;
  changeHostClientTabListener(clientTab: ClientTab): void;
  changeOnlineUsersClientTabListener(clientTab: ClientTab): void;
  changeNameClientTabListener(clientTab: ClientTab): void;
  createMessageClientTabListener(clientTab: ClientTab): void;
  changeNameClientListener(name: string): void;

  deletedTabListener(tabId: number): void;
  createdRoomListener(clientRoom: ClientRoom): void;
  modifiedRoomListener(clientRoom: ClientRoom): void;
  deletedRoomListener(roomnum: string): void;
  joinedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom): void;
  leavedRoomListener(clientTab: ClientTab, clientRoom: ClientRoom): void;

  tokenListener(): string | null;
}
