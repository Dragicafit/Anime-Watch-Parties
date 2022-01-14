import { Socket } from "socket.io-client";
import { ClientListener } from "./clientListener";
import { ClientRoom, ClientRoomSimplier } from "./clientRoom";
import { ClientTab, ClientTabSimplier } from "./clientTab";

export class ClientSimpleContext {
  performance: any;
  clientTabs: Map<number, ClientTab>;
  clientRooms: Map<string, ClientRoom>;
  name: string | undefined;

  constructor(performance: any) {
    this.performance = performance;
    this.clientTabs = new Map();
    this.clientRooms = new Map();
  }
}

export class ClientContext extends ClientSimpleContext {
  socket: Socket;
  clientListener: ClientListener;

  constructor(
    socket: Socket,
    performance: any,
    clientListener: ClientListener
  ) {
    super(performance);
    this.socket = socket;
    this.clientListener = clientListener;
  }

  public simplify(): ClientContextSimplier {
    return {
      clientRooms: new Map(
        [...this.clientRooms].map(([roomnum, clientRoom]) => [
          roomnum,
          clientRoom.simplify(),
        ])
      ),
      clientTabs: new Map(
        [...this.clientTabs].map(([tabId, clientTab]) => [
          tabId,
          clientTab.simplify(),
        ])
      ),
      name: this.name,
    };
  }

  public static complexify(
    clientContextSimplier: ClientContextSimplier,
    performance: any
  ) {
    const clientContext = new ClientSimpleContext(performance);
    clientContext.clientRooms = new Map(
      [...clientContextSimplier.clientRooms].map(([roomnum, clientRoom]) => [
        roomnum,
        ClientRoom.complexify(clientRoom, clientContext),
      ])
    );
    clientContext.clientTabs = new Map(
      [...clientContextSimplier.clientTabs].map(([number, clientTab]) => [
        number,
        ClientTab.complexify(clientTab),
      ])
    );
    for (const [, clientRoom] of clientContext.clientRooms) {
      for (const [number, clientTab] of clientRoom.clientTabs) {
        clientContext.clientTabs.set(number, clientTab);
      }
    }
    clientContext.name = clientContextSimplier.name;
    return clientContext;
  }
}

export interface ClientContextSimplier {
  clientTabs: Map<number, ClientTabSimplier>;
  clientRooms: Map<string, ClientRoomSimplier>;
  name: string | undefined;
}
