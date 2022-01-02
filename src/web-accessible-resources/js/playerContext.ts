import { PlayerAWP } from "./player/playerAWP";
import { PlayerRoom } from "./playerRoom";

export class PlayerContext {
  server: string;
  tabRoom: PlayerRoom;
  $: JQueryStatic;
  window: Window;
  performance: Performance;
  playerAWP: PlayerAWP | undefined;

  constructor(
    server: string,
    tabRoom: PlayerRoom,
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
