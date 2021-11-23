import { Server, Socket } from "socket.io";
import ioChangeStateServer from "../../src/server/io/ioChangeStateServer";
import { IoContext, SocketContext } from "../../src/server/io/ioContext";
import { IoRoom } from "../../src/server/io/ioRoom";
import { IoUtils } from "../../src/server/io/ioUtils";
import { Performance } from "perf_hooks";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";

let io: Server;
let socket: Socket;
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

beforeEach((done) => {
  emit = jest.fn();
  performance = <any>{ now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  state = true;
  time = 1;
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

      let socketContext = new SocketContext(io, socket, performance);
      ioUtils = new IoUtils(socketContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom(roomnum);
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum)!.ioRoom = ioRoom;

      ioChangeStateServer.start(socketContext, ioUtils);
      changeStateServer = (<any>socket).events.changeStateServer;
      done();
    }
  );
});

it.each([
  [true, 1],
  [false, 2e64],
  [false, 1 / 3],
  [true, Math.PI],
])("Valid", (state2, time2) => {
  state = state2;
  time = time2;
  changeStateServer(debugSocket, roomnum, state, time, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
    roomnum: roomnum,
    time: time,
    state: state,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);
  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(2 + Number(state));

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: state,
      currTime: time,
      lastChange: 5,
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
  changeStateServer(debugSocket, roomnum, state, time, callback);

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
])("With invalid state", (state2: any) => {
  state = state2;
  changeStateServer(debugSocket, roomnum, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "state is not boolean");
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
    },
  });
});

it.each([
  null,
  undefined,
  Infinity,
  NaN,
  true,
  "",
  [1],
  () => {},
  function a() {},
])("With invalid time", (time2: any) => {
  time = time2;
  changeStateServer(debugSocket, roomnum, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "time is not int");
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
    },
  });
});

it("Not connected to a room", () => {
  socket.leave(`room-${roomnum}`);
  changeStateServer(debugSocket, roomnum, state, time, callback);

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
  changeStateServer(debugSocket, roomnum, state, time, callback);

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
    },
  });
});

it("Not host", () => {
  ioUtils.getIoRoom(roomnum)!.host = "socket-2";
  changeStateServer(debugSocket, roomnum, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "socket is not host");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-2",
      state: false,
      currTime: 0,
      lastChange: 5,
    },
  });
});
