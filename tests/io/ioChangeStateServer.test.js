#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const ioChangeStateServer = require("../../src/server/io/ioChangeStateServer");
const { IoContext } = require("../../src/server/io/ioContext");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;
let changeStateServer;

/** @type {jest.Mock} */
let debugSocket;
/** @type {String} */
let roomnum;
/** @type {Boolean} */
let state;
/** @type {Number} */
let time;
/** @type {jest.Mock} */
let callback;

/** @type {jest.Mock} */
let emit;
/** @type {Performance} */
let performance;

beforeEach((done) => {
  emit = jest.fn();
  performance = { now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  state = true;
  time = 1;
  callback = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      socket.to = (roomKey) => {
        if (roomKey === `room-${roomnum}`) {
          return { emit: emit };
        }
      };

      IoRoom.ioContext = new IoContext(io, null, performance);
      let ioContext = new IoContext(io, socket, performance);
      ioUtils = new IoUtils(ioContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom();
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      ioChangeStateServer.start(ioContext, ioUtils);
      changeStateServer = socket.events.changeStateServer;
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
    time: time,
    state: state,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(2 + state);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: state,
      currTime: time,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
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
])("With invalid state", (state2) => {
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
      currVideo: undefined,
      site: undefined,
      location: undefined,
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
])("With invalid time", (time2) => {
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
      currVideo: undefined,
      site: undefined,
      location: undefined,
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
  io.sockets.adapter.rooms.get(roomnum).ioRoom = ioRoom;
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
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
  });
});

it("Not host", () => {
  ioUtils.getIoRoom(roomnum).host = "socket-2";
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
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
  });
});
