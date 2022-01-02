import { TwitchEmbed } from "./embed/twitchEmbed";
import { TabRoom } from "./tabRoom";

export class TabContext {
  tabRoom: TabRoom;
  $: JQueryStatic;
  window: Window;
  performance: Performance;
  name: string | undefined;
  embed: TwitchEmbed | undefined;

  constructor(
    tabRoom: TabRoom,
    $: JQueryStatic,
    window: Window,
    performance: Performance
  ) {
    this.tabRoom = tabRoom;
    this.$ = $;
    this.window = window;
    this.performance = performance;
  }
}
