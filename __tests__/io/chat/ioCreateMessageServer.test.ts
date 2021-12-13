import { Performance } from "perf_hooks";
import { Server, Socket } from "socket.io";
import ioCreateMessageServer from "../../../src/server/io/chat/ioCreateMessageServer";
import { IoCallback, IoDebugSocket } from "../../../src/server/io/ioConst";
import { IoContext, SocketContext } from "../../../src/server/io/ioContext";
import { IoRoom } from "../../../src/server/io/ioRoom";
import { IoUtils } from "../../../src/server/io/ioUtils";

let io: Server;
let socket: Socket;
let socketContext: SocketContext;
let ioUtils: IoUtils;
let createMessageServer: (
  debugSocket: IoDebugSocket,
  roomnum: string,
  message: string,
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let roomnum: string;
let message: string;
let callback: jest.Mock;

let emit: jest.Mock;
let performance: Performance;

beforeEach((done) => {
  emit = jest.fn();
  performance = <any>{ now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  message = "message";
  callback = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(<Server>io, <Performance>performance);
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      socket.to = <any>((roomKey: string) => {
        if (roomKey === `room-${roomnum}`) {
          return { emit: emit };
        }
      });

      socketContext = new SocketContext(io, socket, performance);
      socketContext.name = "socket";
      ioUtils = new IoUtils(socketContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom(roomnum);
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum)!.ioRoom = ioRoom;

      ioCreateMessageServer.start(socketContext, ioUtils);
      createMessageServer = (<any>socket).events.createMessageServer;
      done();
    }
  );
});

it.each([" ", "‎", "a", Array(201).join("x")])("Valid", (message2) => {
  message = message2;
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "createMessageClient", {
    roomnum: roomnum,
    sender: socketContext.name,
    message: message,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);
  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      messages: [{ sender: socket.id, message: message }],
    },
  });
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
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);
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
])("With invalid state", (message2: any) => {
  message = message2;
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "message is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      messages: [],
    },
  });
});

it("Not connected to a room", () => {
  socket.leave(`room-${roomnum}`);
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("is in an non-existent room", () => {
  let ioRoom = ioUtils.getIoRoom(roomnum);
  socket.leave(`room-${roomnum}`);
  socket.join(roomnum);
  (<any>io.sockets.adapter.rooms.get(roomnum)!).ioRoom = ioRoom;
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
  expect(io.sockets.adapter.rooms.get(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      messages: [],
    },
  });
});

it("Not host", () => {
  createMessageServer(debugSocket, roomnum, message, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "createMessageClient", {
    roomnum: roomnum,
    sender: socketContext.name,
    message: message,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);
  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      messages: [{ sender: socket.id, message: message }],
    },
  });
});
