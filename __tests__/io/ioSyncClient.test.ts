import { Server, Socket } from "socket.io";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";
import { SocketContext } from "../../src/server/io/ioContext";
import ioSyncClient from "../../src/server/io/ioSyncClient";
import { IoUtils } from "../../src/server/io/ioUtils";

let io: Server;
let socket: Socket;
let ioUtils: IoUtils;
let syncClient: (
  debugSocket: IoDebugSocket,
  roomnum: string,
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let roomnum: string;
let callback: jest.Mock;

beforeEach((done) => {
  debugSocket = jest.fn();
  roomnum = "roomnum";
  callback = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket, <any>null);
      ioUtils = new IoUtils(socketContext);
      ioUtils.syncClient = jest.fn();

      ioSyncClient.start(socketContext, ioUtils);
      syncClient = (<any>socket).events.syncClient;
      done();
    }
  );
});

it("Valid", () => {
  syncClient(debugSocket, roomnum, callback);

  expect(callback).toHaveBeenNthCalledWith(1, null, {});
  expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
    1,
    debugSocket,
    roomnum,
    callback,
    {}
  );

  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
});

it.each([
  null,
  undefined,
  Infinity,
  NaN,
  0,
  "",
  [true],
  () => {},
  function a() {},
])("With invalid roomnum", (roomnum2: any) => {
  roomnum = roomnum2;
  syncClient(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
});
