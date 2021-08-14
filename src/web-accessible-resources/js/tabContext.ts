import { PlayerAWP } from "./player/playerAWP";
import { TabRoom } from "./tabRoom";

export class TabContext {
  server: string;
  tabRoom: TabRoom;
  $: JQueryStatic;
  window: Window;
  performance: Performance;
  playerAWP: PlayerAWP | undefined;

  constructor(
    server: string,
    tabRoom: TabRoom,
    $: JQueryStatic,
    window: Window,
    performance: Performance
  ) {
    this.server = server;
    this.tabRoom = tabRoom;
    this.$ = $;
    this.window = window;
    this.performance = performance;
  }
}
