import { ChatEmbed } from "./embed/chatEmbed";
import { TabRoom } from "./tabRoom";

export class TabContext {
  tabRoom: TabRoom;
  $: JQueryStatic;
  window: Window;
  performance: Performance;
  name: string | undefined;
  embed: ChatEmbed | undefined;

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
