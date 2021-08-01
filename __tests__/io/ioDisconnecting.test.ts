import { Server as Server, Socket as Socket } from "socket.io";
import { IoContext, SocketContext } from "../../src/server/io/ioContext";
import ioDisconnecting from "../../src/server/io/ioDisconnecting";
import { IoRoom } from "../../src/server/io/ioRoom";
import { IoUtils } from "../../src/server/io/ioUtils";

let io: Server;
let socket: Socket;
let disconnecting: () => void;

let ioUtils: IoUtils;
let roomnum: string;

let debugDisconnecting: jest.Mock;

beforeEach((done) => {
  roomnum = "roomnum";
  debugDisconnecting = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(io, <any>{ now: () => 5 });
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket, <any>null);
      ioUtils = new IoUtils(socketContext);
      ioUtils.updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom(roomnum);
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum)!.ioRoom = ioRoom;

      ioDisconnecting.start(socketContext, ioUtils, <any>debugDisconnecting);
      disconnecting = (<any>socket).events.disconnecting;
      done();
    }
  );
});

it("With Roomnum and is host", () => {
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With Roomnum and is not host", () => {
  ioUtils.getIoRoom(roomnum)!.host = "2";
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("Without Roomnum", () => {
  socket.leave(`room-${roomnum}`);
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With error", () => {
  socket.leave(`room-${roomnum}`);
  socket.join(roomnum);
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
  expect((<any>io.sockets.adapter.rooms.get(roomnum)).ioRoom).toBeUndefined();
  // the room will be destroyed on disconnect
});
