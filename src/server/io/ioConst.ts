export interface IoCallback {
  (err: string | null, data?: any): void;
}

export interface IoDebugSocket {
  (...args: any[]): void;
}

export enum supportedEvents {
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  CHANGE_STATE_SERVER = "changeStateServer",
  CHANGE_VIDEO_SERVER = "changeVideoServer",
  SYNC_CLIENT = "syncClient",
}
