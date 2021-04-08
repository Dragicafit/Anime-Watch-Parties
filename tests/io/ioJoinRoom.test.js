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
let joinRoom;

/** @type {jest.Mock} */
let debugSocket;
/** @type {String} */
let newRoomnum;
/** @type {jest.Mock} */
let callback;

/** @type {IoUtils} */
let ioUtils;
/** @type {String} */
let oldRoomnum;
/** @type {Performance} */
let performance;

/** @type {jest.Mock} */
let syncClient;
/** @type {jest.Mock} */
let updateRoomUsers;

beforeEach((done) => {
  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      oldRoomnum = "roomnum1";
      debugSocket = jest.fn();
      newRoomnum = "roomnum2";
      callback = jest.fn();

      syncClient = jest.fn();
      updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));
      performance = { now: jest.fn(() => 5) };

      IoRoom.ioContext = new IoContext(io, null, performance);
      let ioContext = new IoContext(io, socket, performance);
      ioUtils = new IoUtils(ioContext);
      ioUtils.syncClient = syncClient;
      ioUtils.updateRoomUsers = updateRoomUsers;

      // join room
      socket.join(`room-${oldRoomnum}`);
      ioUtils.getRoom(oldRoomnum).ioRoom = new IoRoom();

      ioJoinRoom.start(ioContext, ioUtils);
      joinRoom = socket.events.joinRoom;
      done();
    }
  );
});

it.each(["r", "roomnum_", Array(31).join("x")])(
  "Change room from existing room to new room",
  (newRoomnum2) => {
    newRoomnum = newRoomnum2;
    joinRoom(debugSocket, newRoomnum, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
    expect(debugSocket).toHaveBeenNthCalledWith(
      2,
      `connected to room-${newRoomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
    expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
    expect(callback).toHaveBeenNthCalledWith(1, null, {
      roomnum: newRoomnum,
      host: true,
    });

    expect(debugSocket).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(2);

    expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
    expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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

it("Change room from non-existing room to new room", () => {
  socket.leave(`room-${oldRoomnum}`);
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: newRoomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(2);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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

it("Change room from existing room to existing room", () => {
  socket.join(`room-${newRoomnum}`);

  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
  expect(debugSocket).toHaveBeenNthCalledWith(
    2,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: newRoomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(2);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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

it("Change room from non-existing room to existing room", () => {
  socket.leave(`room-${oldRoomnum}`);
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: newRoomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(2);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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
  newRoomnum = oldRoomnum;
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: newRoomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(oldRoomnum)).toMatchObject({
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
  expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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
])("With invalid roomnum", (newRoomnum2) => {
  newRoomnum = newRoomnum2;
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(oldRoomnum)).toMatchObject({
    ioRoom: {
      currTime: 0,
      currVideo: undefined,
      host: undefined,
      lastChange: 5,
      location: undefined,
      site: undefined,
      state: false,
    },
  });
  expect(io.sockets.adapter.rooms.get(`room-${newRoomnum}`)).toBeUndefined();
});

it("With error", () => {
  socket.leave(`room-${oldRoomnum}`);
  socket.join(oldRoomnum);
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
  expect(debugSocket).toHaveBeenNthCalledWith(
    2,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    host: true,
    roomnum: oldRoomnum,
  });

  expect(debugSocket).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(2);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(newRoomnum)).toMatchObject({
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
  socket.leave(`room-${oldRoomnum}`);
  socket.join(newRoomnum);
  joinRoom(debugSocket, newRoomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${newRoomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "room is null (error server)");
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

  expect(debugSocket).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(oldRoomnum)).toBeUndefined();
  expect(ioUtils.getRoom(newRoomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(newRoomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
});
