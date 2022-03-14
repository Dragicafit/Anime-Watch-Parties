import { ClientContext } from "../client/clientContext";
export class DiscordContext {
  clientContext: ClientContext;
  tabIdToDelete: number | undefined;
  searchingToken = false;
  lastTabId: number | undefined;
  tabVideoInfos: Map<
    number,
    {
      titleEpisode: string;
      urlSerie: string;
      urlEpisode: string;
      videoDuration: number;
    }
  > = new Map();

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
  }
}
