export interface IoCallback {
  (err: string | null, data?: Data): void;
}

export interface Data {
  roomnum?: string;
  videoId?: string;
  site?: SupportedSite;
  location?: string;
  time?: number;
  state?: boolean;
  host?: boolean;
  onlineUsers?: number;
  logs?: string[];
  name?: string;
  message?: string;
  messages?: { sender: string; message: string }[];
}

export type SupportedSite =
  | "wakanim"
  | "crunchyroll"
  | "funimation"
  | "oldFunimation"
  | "adn";

export interface IoDebugSocket {
  (...args: any[]): void;
}

export enum eventsServerReceive {
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  CHANGE_STATE_SERVER = "changeStateServer",
  CHANGE_VIDEO_SERVER = "changeVideoServer",
  SYNC_CLIENT = "syncClient",
  REPORT_BUG = "reportBug",
  CHANGE_NAME = "changeName",
  CREATE_MESSAGE_SERVER = "createMessageServer",
}

export enum eventsServerSend {
  CHANGE_STATE_CLIENT = "changeStateClient",
  GET_USERS = "getUsers",
  UNSET_HOST = "unsetHost",
  CHANGE_VIDEO_CLIENT = "changeVideoClient",
  CREATE_MESSAGE_CLIENT = "createMessageClient",
  LEAVE_ROOM = "leaveRoom",
}
