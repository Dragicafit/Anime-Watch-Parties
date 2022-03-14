import {
  SERVER_JOIN_URL,
  SERVER_URL,
} from "../background-scripts/backgroundConst";
import { ClientRoom } from "../client/clientRoom";
import { SupportedSite } from "../server/io/ioConst";
import { DiscordContext } from "./discordContext";

export class DiscordSocket {
  private PLAY_IMAGE = "938214997669064787";
  private PAUSE_IMAGE = "938214997358686248";
  private CRUNCHYROLL_LOGO_IMAGE = "938224230741463041";

  private siteToImage = {
    crunchyroll: this.CRUNCHYROLL_LOGO_IMAGE,
    funimation: this.CRUNCHYROLL_LOGO_IMAGE,
    wakanim: this.CRUNCHYROLL_LOGO_IMAGE,
    adn: this.CRUNCHYROLL_LOGO_IMAGE,
    oldFunimation: this.CRUNCHYROLL_LOGO_IMAGE,
  };

  private siteToName = {
    crunchyroll: "Crunchyroll",
    funimation: "Funimation",
    wakanim: "Wakanim",
    adn: "ADN",
    oldFunimation: "Funimation",
  };

  private context: DiscordContext;
  private socket: WebSocket | undefined;
  private noRespondTimeout: number | undefined;
  private status: string | undefined;

  constructor(context: DiscordContext) {
    this.context = context;
  }

  start(token: string) {
    this.context.searchingToken = false;
    clearTimeout(this.noRespondTimeout);
    this.noRespondTimeout = undefined;

    if (token == null) {
      this.socket?.close();
      this.socket = undefined;
      return;
    }

    this.noRespondTimeout = <any>setTimeout(this.start, 5000, token);
    if (this.socket != null) {
      this.socket.close();
    }
    this.socket = new WebSocket("wss://gateway.discord.gg/?encoding=json&v=9");

    this.socket.onopen = () => {
      this.socket?.send(
        JSON.stringify({
          op: 2,
          d: {
            token: token,
            properties: {},
            intents: 0,
          },
        })
      );
      this.socket?.addEventListener("message", (message) => {
        let data = JSON.parse(message.data);
        if (data?.t === "READY" && data?.d?.user_settings?.status != null) {
          clearTimeout(this.noRespondTimeout);
          this.noRespondTimeout = undefined;
          this.status = data.d.user_settings.status;
        }
      });
      setInterval(() => {
        this.socket?.send(JSON.stringify({ op: 1, d: null }));
      }, 30 * 1000);
    };
  }

  sendInfo(clientRoom: ClientRoom, tabId: number) {
    let tabVideoInfo = this.context.tabVideoInfos.get(tabId);
    if (tabVideoInfo == null) {
      return;
    }
    this.context.lastTabId = tabId;

    this.sendActivity({
      titleEpisode: tabVideoInfo.titleEpisode,
      onlineUsers: clientRoom.onlineUsers,
      site: "crunchyroll",
      playing: clientRoom.getState(),
      roomId: clientRoom.roomnum,
      urlSerie: tabVideoInfo.urlSerie,
    });
  }

  sendActivity(
    info: {
      titleEpisode: string;
      onlineUsers: number;
      site: SupportedSite;
      playing: boolean;
      roomId: string | null;
      urlSerie: string;
    } | null
  ) {
    if (this.status == null) {
      return;
    }
    this.socket?.send(
      JSON.stringify({
        op: 3,
        d: this.activity(info),
      })
    );
  }

  private activity(
    info: {
      titleEpisode: string;
      onlineUsers: number;
      site: SupportedSite;
      playing: boolean;
      roomId: string | null;
      urlSerie: string;
    } | null
  ) {
    if (info == null) {
      return {
        status: this.status,
        afk: false,
        since: 0,
        activities: [],
      };
    }

    let titleEpisode = info.titleEpisode;
    let titleEpisodeShort = titleEpisode;
    if (titleEpisodeShort.length > 25) {
      titleEpisodeShort = `${titleEpisodeShort.substring(0, 22)}...`;
    }
    return {
      status: this.status,
      afk: false,
      since: 0,
      activities: [
        {
          application_id: "934593653651931197",
          type: 3,
          name: "Anime Watch Parties",
          details: titleEpisode,
          state:
            info.onlineUsers <= 1
              ? "Alone"
              : `With ${info.onlineUsers - 1} friends`,
          assets: {
            large_image: this.siteToImage[info.site],
            large_text: this.siteToName[info.site],
            small_image: info.playing ? this.PLAY_IMAGE : this.PAUSE_IMAGE,
            small_text: info.playing ? "Playing" : "Paused",
          },
          buttons: [
            info.roomId != null ? "Join Room" : "About Anime Watch Parties",
            `About ${titleEpisodeShort}`,
          ],
          metadata: {
            button_urls: [
              info.roomId != null
                ? `https://${SERVER_JOIN_URL}/${info.roomId}`
                : SERVER_URL,
              info.urlSerie,
            ],
          },
        },
      ],
    };
  }
}
