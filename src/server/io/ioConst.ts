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

export enum supportedEvents {
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  CHANGE_STATE_SERVER = "changeStateServer",
  CHANGE_VIDEO_SERVER = "changeVideoServer",
  SYNC_CLIENT = "syncClient",
}
