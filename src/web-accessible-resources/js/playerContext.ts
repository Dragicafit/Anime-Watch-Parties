import { PlayerAWP } from "./player/playerAWP";
import { PlayerRoom } from "./playerRoom";

export class PlayerContext {
  tabRoom: PlayerRoom;
  window: Window;
  performance: Performance;
  playerAWP: PlayerAWP | undefined;

  constructor(tabRoom: PlayerRoom, window: Window, performance: Performance) {
    this.tabRoom = tabRoom;
    this.window = window;
    this.performance = performance;
  }
}
