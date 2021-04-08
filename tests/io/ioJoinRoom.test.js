#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const ioJoinRoom = require("../../src/server/io/ioJoinRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoContext } = require("../../src/server/io/ioContext");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;
let joinRoom;

/** @type {jest.Mock} */
let debugSocket;
/** @type {String} */
let roomnum;
/** @type {jest.Mock} */
let callback;

/** @type {Performance} */
let performance;

beforeEach((done) => {
  performance = { now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  callback = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      IoRoom.ioContext = new IoContext(io, null, performance);
      let ioContext = new IoContext(io, socket, performance);
      ioUtils = new IoUtils(ioContext);
      ioUtils.syncClient = jest.fn();
      ioUtils.updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

      ioJoinRoom.start(ioContext, ioUtils);
      joinRoom = socket.events.joinRoom;
      done();
    }
  );
});

it.each(["r", "roomnum_", Array(31).join("x")])(
  "Join new room",
  (newRoomnum2) => {
    roomnum = newRoomnum2;
    joinRoom(debugSocket, roomnum, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `connected to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
    expect(callback).toHaveBeenNthCalledWith(1, null, {
      roomnum: roomnum,
      host: true,
    }); /*
    expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
      1,
      debugSocket,
      roomnum,
      callback
    );*/
    expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      roomnum
    );

    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
    expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        currTime: 0,
        currVideo: undefined,
        host: "socket-1",
        lastChange: 5,
        state: false,
        location: undefined,
        site: undefined,
      },
    });
  }
);

it("Join new room but almost too many rooms joined", () => {
  for (let i = 0; i < 9; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  joinRoom(debugSocket, roomnum, callback);

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
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: "socket-1",
      lastChange: 5,
      state: false,
      location: undefined,
      site: undefined,
    },
  });
});
it("Join new room but too many rooms joined", () => {
  for (let i = 0; i < 10; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "too many rooms joined");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("Join existing room", () => {
  socket.join(`room-${roomnum}`);

  joinRoom(debugSocket, roomnum, callback);

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
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: "socket-1",
      lastChange: 5,
      state: false,
      location: undefined,
      site: undefined,
    },
  });
});

it("Join existing room but too many rooms joined", () => {
  for (let i = 0; i < 9; i++) {
    socket.join(`room-${roomnum}${i}`);
  }
  socket.join(`room-${roomnum}`);
  joinRoom(debugSocket, roomnum, callback);

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
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: "socket-1",
      lastChange: 5,
      state: false,
      location: undefined,
      site: undefined,
    },
  });
});

it("Change room to same room", () => {
  socket.join(`room-${roomnum}`);
  ioUtils.getRoom(roomnum).ioRoom = new IoRoom();
  joinRoom(debugSocket, roomnum, callback);

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
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: "socket-1",
      lastChange: 5,
      location: undefined,
      site: undefined,
      state: false,
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
])("With invalid roomnum", (roomnum2) => {
  roomnum = roomnum2;
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(io.sockets.adapter.rooms.get(`room-${roomnum}`)).toBeUndefined();
});

it("With error", () => {
  let oldRoomnum = "roomnum2";
  socket.join(oldRoomnum);
  joinRoom(debugSocket, roomnum, callback);

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
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: "socket-1",
      lastChange: 5,
      location: undefined,
      site: undefined,
      state: false,
    },
  });
  expect(io.sockets.adapter.rooms.get(oldRoomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
});

it("With error, same room", () => {
  socket.join(roomnum);
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(
    2,
    "room is null (error socket.io)"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

  expect(debugSocket).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
  expect(io.sockets.adapter.rooms.get(roomnum).ioRoom).toBeUndefined();
});
