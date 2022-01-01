import "dotenv/config";
import { Performance } from "perf_hooks";
import { Server } from "socket.io";
import { io as ioClient, Socket as SocketClient } from "socket.io-client";
import { ClientContext } from "../../src/client/clientContext";
import { ClientListener } from "../../src/client/clientListener";
import { ClientScript } from "../../src/client/clientScript";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";
import { IoUtils } from "../../src/server/io/ioUtils";
import ioServerSetup from "../../src/server/ioServerSetup";

jest.unmock("socket.io");

let socket: SocketClient;
let clientListenerMock: ClientListener;
let clientScript: ClientScript;
let ioUtils: IoUtils;
let changeStateServer: (
  debugSocket: IoDebugSocket,
  roomnum: string,
  state: boolean,
  time: number,
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let roomnum: string;
let state: boolean;
let time: number;
let callback: jest.Mock;

let emit: jest.Mock;
let performance: Performance;

const portTest = Number(process.env.PORT_TEST) || 4001;
const port =
  Number(process.env.PORT) !== portTest + 1 ? portTest + 1 : portTest + 2;

let io: Server;

beforeEach(() => {
  return new Promise<void>((resolve) => {
    performance = <any>{ now: jest.fn(() => 5) };
    io = new Server(port);
    ioServerSetup.start(io);

    clientListenerMock = {
      askVideoListener: jest.fn(),
      askStateListener: jest.fn(),

      changeStateClientTabListener: jest.fn(),
      changeVideoClientTabListener: jest.fn(),
      changeHostClientTabListener: jest.fn(),
      changeOnlineUsersClientTabListener: jest.fn(),
      createMessageClientTabListener: jest.fn(),

      createdTabListener: jest.fn(),
      deletedTabListener: jest.fn(),
      createdRoomListener: jest.fn(),
      modifiedRoomListener: jest.fn(),
      deletedRoomListener: jest.fn(),
      joinedRoomListener: jest.fn(),
      leavedRoomListener: jest.fn(),
    };

    socket = ioClient(`http://localhost:${port}`, {
      reconnectionDelay: 0,
      forceNew: true,
    });
    socket.on("connect", () => {
      const clientContext = new ClientContext(
        socket,
        performance,
        clientListenerMock
      );
      clientScript = new ClientScript(clientContext);
      resolve();
    });
  });
});

afterEach(() => {
  if (socket?.connected) {
    socket.disconnect();
  } else {
    console.error("no connection to break...");
  }
  ioServerSetup.close(io);
});

it("test createRoom", (done) => {
  expect(clientScript.clientContext.clientRooms.size).toEqual(0);
  clientListenerMock.joinedRoomListener = () => {
    const clientRooms = clientScript.clientContext.clientRooms;
    expect(clientRooms.size).toEqual(1);
    const clientRoom = Array.from(clientRooms.values())[0];
    expect(clientRoom).toMatchObject({
      state: false,
      currTime: 0,
      lastChange: 5,
    });
    expect(clientRoom.getUrl()).toBeUndefined();
    expect(clientRoom.roomnum).toBeDefined();

    const clientTabs = clientScript.clientContext.clientTabs;
    expect(clientTabs.size).toEqual(1);
    const clientTab = Array.from(clientTabs.values())[0];
    expect(clientTab.getClientRoom()).toEqual(clientRoom);

    const clientRoomTabs = clientScript.clientContext.clientTabs;
    expect(clientRoomTabs.size).toEqual(1);
    const clientRoomTab = Array.from(clientRoomTabs.values())[0];
    expect(clientRoomTab).toEqual(clientTab);

    done();
  };
  const clientTab = clientScript.clientUtils.createTab(1);
  clientScript.clientEvent.createRoom(clientTab);
});
