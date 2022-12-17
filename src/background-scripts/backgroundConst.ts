export const parseUrlWakanim =
  /^\/(?<location>[a-zA-Z]{2})\/v2\/\w+\/episode\/(?<videoId>\d+)/;
export const parseUrlCrunchyroll =
  /^\/(?:(?<location>[a-zA-Z]{2})\/)?(?<serie_name>[\w-]+)\/episode[\w-]*-(?<media_id>\d+)/;
export const parseUrlNewCrunchyroll =
  /^\/(?:(?<location>[a-zA-Z]{2})\/)?watch\/(?<etp_guid>[A-Z0-9]+)/;
export const parseUrlOldFunimation =
  /^\/(?<location>[a-zA-Z]{2})\/shows\/(?<videoId>[\w-]+\/[\w-]+)/;
export const parseUrlFunimation = /^\/v\/(?<videoId>[\w-]+\/[\w-]+)/; //
export const parseUrlAdn = /^\/video\/(?<videoId>[\w-]+\/\d+)/;
export const parseUrlAwp = /^\/(?<roomnum>[a-zA-Z0-9]{5})$/;

export enum eventsBackgroundReceive {
  ASK_INFO = "askInfo",
  ASK_ACTUAL_URL = "askActualUrl",
  JOIN_TAB = "joinTab",
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  SCRIPT_LOADED = "scriptLoaded",
  SEND_STATE = "sendState",
  SEND_NAME = "sendName",
  CREATE_MESSAGE = "createMessage",
  RESTART_SOCKET = "restartSocket",
  SYNC_CLIENT = "syncClient",
  REPORT_BUG = "reportBug",
}

export enum eventsBackgroundSend {
  CHANGE_STATE_CLIENT = "changeStateClient",
  ASK_STATE = "askState",
  SEND_INFO = "sendInfo",
  SEND_ACTUAL_URL = "sendActualUrl",
}

export const SERVER_JOIN_URL =
  process.env["NODE_ENV"] === "production" ? "awp.moe" : "localhost:4000";

export const SERVER_URL =
  process.env["NODE_ENV"] === "production"
    ? "https://animewatchparties.com"
    : "https://localhost:4000";

export const AWP_TOKEN = "AWP-token";
