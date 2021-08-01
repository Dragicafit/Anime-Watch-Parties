import { Server, Socket } from "socket.io";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";
import { SocketContext } from "../../src/server/io/ioContext";
import ioLeaveRoom from "../../src/server/io/ioLeaveRoom";
import { IoUtils } from "../../src/server/io/ioUtils";

let io: Server;
let socket: Socket;
let ioUtils: IoUtils;
let leaveRoom: (
  debugSocket: IoDebugSocket,
  roomnum: any,
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let roomnum: any;
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
      let socketContext = new SocketContext(<any>null, socket, <any>null);
      ioUtils = new IoUtils(socketContext);
      ioUtils.leaveRoom = jest.fn();

      ioLeaveRoom.start(socketContext, ioUtils);
      leaveRoom = (<any>socket).events.leaveRoom;
      done();
    }
  );
});

it("Valid", () => {
  leaveRoom(debugSocket, roomnum, callback);

  expect(callback).toHaveBeenNthCalledWith(1, null, {});
  expect(ioUtils.leaveRoom).toHaveBeenNthCalledWith(1, debugSocket, roomnum);

  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.leaveRoom).toHaveBeenCalledTimes(1);
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
])("With invalid roomnum", (roomnum2) => {
  roomnum = roomnum2;
  leaveRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.leaveRoom).toHaveBeenCalledTimes(0);
});
