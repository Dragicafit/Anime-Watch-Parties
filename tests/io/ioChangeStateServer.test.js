#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioChangeStateServer = require("../../src/server/io/ioChangeStateServer");
const IoContext = require("../../src/server/io/ioContext");
const IoRoom = require("../../src/server/io/ioRoom");
const IoUtils = require("../../src/server/io/ioUtils");

/** @type {ioServer} */
let io;
/** @type {SocketServer} */
let socket;
let changeStateServer;

/** @type {jest.Mock} */
let debugSocket;
let state;
let time;
/** @type {jest.Mock} */
let callback;

/** @type {IoRoom} */
let ioRoom;
/** @type {jest.Mock} */
let emit;
/** @type {Performance} */
let performance;

beforeEach(() => {
  emit = jest.fn();
  socket = {
    on: (event, cb) => {
      if (event === "changeStateServer") {
        changeStateServer = cb;
      }
    },
    id: "1",
    rooms: new Set("1"),
    to: (roomKey) => {
      if (roomKey === "room-roomnum") {
        return { emit: emit };
      }
    },
  };
  io = {
    sockets: {
      sockets: new Map([[socket.id, socket]]),
      adapter: { rooms: new Map() },
    },
  };
  debugSocket = jest.fn();
  state = true;
  time = 1;
  callback = jest.fn();

  performance = { now: jest.fn(() => 5) };

  IoRoom.ioContext = new IoContext(io, null, performance);

  // join room
  ioRoom = new IoRoom();
  ioRoom.host = "1";
  io.sockets.adapter.rooms.set("room-roomnum", { ioRoom: ioRoom });
  socket.rooms.add("roomnum");

  let ioContext = new IoContext(io, socket, performance);
  ioChangeStateServer.start(ioContext, new IoUtils(ioContext));
});

it.each([
  [true, 1],
  [false, 2e64],
  [false, 1 / 3],
  [true, Math.PI],
])("Valid", (state2, time2) => {
  state = state2;
  time = time2;
  changeStateServer(debugSocket, state, time, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
    time: time,
    state: state,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(2 + state);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: state,
    currTime: time,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
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
])("With invalid state", (state2) => {
  state = state2;
  changeStateServer(debugSocket, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "state is not boolean");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
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
  changeStateServer(debugSocket, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "time is not int");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("Not connected to a room", () => {
  socket.rooms.delete("roomnum");
  changeStateServer(debugSocket, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("is in an non-existent room", () => {
  socket.rooms.delete("roomnum");
  socket.rooms.add("2");
  changeStateServer(debugSocket, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("Not host", () => {
  ioRoom.host = "2";
  changeStateServer(debugSocket, state, time, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "socket is not host");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "2",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});
