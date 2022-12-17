import { Socket } from "socket.io-client";
import { ClientContext } from "../../client-new/clientContext";
import { ClientListener } from "../../client-new/clientListener";
import { PlayerAWP } from "./player/playerAWP";

export class PlayerContext extends ClientContext {
  window: Window;
  playerAWP?: PlayerAWP;

  constructor(
    socket: Socket,
    performance: any,
    clientListener: ClientListener,
    window: Window
  ) {
    super(socket, performance, clientListener);
    this.window = window;
  }
}
