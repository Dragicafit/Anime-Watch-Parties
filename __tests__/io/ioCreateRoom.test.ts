import { Performance } from "perf_hooks";
import { Server, Socket } from "socket.io";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";
import { IoContext, SocketContext } from "../../src/server/io/ioContext";
import ioCreateRoom from "../../src/server/io/ioCreateRoom";
import { IoRoom } from "../../src/server/io/ioRoom";
import { IoUtils } from "../../src/server/io/ioUtils";

let io: Server;
let socket: Socket;
let ioUtils: IoUtils;
let createRoom: (debugSocket: IoDebugSocket, callback: IoCallback) => void;

let debugSocket: jest.Mock;
let roomnum: any;
let callback: jest.Mock;

let performance: Performance;

beforeEach((done) => {
  performance = <any>{ now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  callback = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(io, performance);
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket, performance);
      ioUtils = new IoUtils(socketContext);
      ioUtils.syncClient = jest.fn();
      ioUtils.updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));
      ioUtils.createRandomRoomnum = jest.fn(() => roomnum);

      ioCreateRoom.start(socketContext, ioUtils);
      createRoom = (<any>socket).events.createRoom;
      done();
    }
  );
});

it("Create new room", () => {
  createRoom(debugSocket, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });
  expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
    1,
    debugSocket,
    roomnum,
    callback,
    {
      roomnum: roomnum,
      host: true,
    }
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum,
    {
      roomnum: roomnum,
      host: true,
    }
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      host: "socket-1",
      lastChange: 5,
      state: false,
    },
  });
});

it("Create new room but almost too many rooms joined", () => {
  for (let i = 0; i < 9; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  createRoom(debugSocket, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });
  expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
    1,
    debugSocket,
    roomnum,
    callback,
    {
      roomnum: roomnum,
      host: true,
    }
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum,
    {
      roomnum: roomnum,
      host: true,
    }
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      host: "socket-1",
      lastChange: 5,
      state: false,
    },
  });
});

it("Create new room but too many rooms joined", () => {
  for (let i = 0; i < 10; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  createRoom(debugSocket, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "too many rooms joined");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");
  expect(callback).toHaveBeenNthCalledWith(2, null, {});

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(2);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("Create existing room", (done) => {
  let socket2 = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-2" },
    null,
    () => {
      socket2.join(`room-${roomnum}`);
      ioUtils.getRoom(roomnum)!.ioRoom = new IoRoom(roomnum);
      roomnum = "roomnum2";

      createRoom(debugSocket, callback);

      expect(debugSocket).toHaveBeenNthCalledWith(
        1,
        `connected to room-${roomnum}`
      );
      expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
      expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
      expect(callback).toHaveBeenNthCalledWith(1, null, {
        roomnum: roomnum,
        host: true,
      });
      expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
        1,
        debugSocket,
        roomnum,
        callback,
        {
          roomnum: roomnum,
          host: true,
        }
      );
      expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        roomnum,
        {
          roomnum: roomnum,
          host: true,
        }
      );

      expect(debugSocket).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
      expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
      expect(performance.now).toHaveBeenCalledTimes(2);

      expect(ioUtils.getRoom(roomnum)).toMatchObject({
        ioRoom: {
          currTime: 0,
          host: "socket-1",
          lastChange: 5,
          state: false,
        },
      });
      done();
    }
  );
});

it("Create existing room but too many rooms joined", (done) => {
  for (let i = 0; i < 10; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  let socket2 = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-2" },
    null,
    () => {
      socket2.join(`room-${roomnum}`);
      ioUtils.getRoom(roomnum)!.ioRoom = new IoRoom(roomnum);
      roomnum = "roomnum2";

      createRoom(debugSocket, callback);

      expect(debugSocket).toHaveBeenNthCalledWith(1, "too many rooms joined");
      expect(callback).toHaveBeenNthCalledWith(1, "access denied");
      expect(callback).toHaveBeenNthCalledWith(2, null, {});

      expect(debugSocket).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
      expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);
      expect(performance.now).toHaveBeenCalledTimes(1);

      done();
    }
  );
});

it("With error", () => {
  let oldRoomnum = "roomnum2";
  socket.join(oldRoomnum);

  createRoom(debugSocket, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    host: true,
    roomnum: roomnum,
  });
  expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
    1,
    debugSocket,
    roomnum,
    callback,
    {
      roomnum: roomnum,
      host: true,
    }
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum,
    { host: true, roomnum: "roomnum" }
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      host: "socket-1",
      lastChange: 5,
      state: false,
    },
  });
  expect(io.sockets.adapter.rooms.get(oldRoomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
});
