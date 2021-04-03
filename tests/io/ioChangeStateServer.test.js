#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioChangeStateServer = require("../../src/server/io/ioChangeStateServer");
const Room = require("../../src/server/io/room");

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

/** @type {Room} */
let room;
/** @type {jest.Mock} */
let emit;
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
    roomnum: "roomnum",
    broadcast: {
      to: (roomKey) => {
        if (roomKey === "room-roomnum") {
          return { emit: emit };
        }
      },
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

  room = { host: "1" };
  io.sockets.adapter.rooms.set("room-roomnum", room);

  performance = { now: jest.fn(() => 5) };

  ioChangeStateServer.start(io, socket, performance);
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

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
    time: time,
    state: state,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
  expect(performance.now).toHaveBeenNthCalledWith(1);

  expect(room).toStrictEqual({
    host: "1",
    currTime: time,
    lastChange: 5,
    state: state,
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

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "state is not boolean");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(room).toStrictEqual({ host: "1" });
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

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "time is not int");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(room).toStrictEqual({ host: "1" });
});

it("Not connected to a room", () => {
  socket.roomnum = null;
  changeStateServer(debugSocket, state, time, callback);

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(room).toStrictEqual({ host: "1" });
});

it("With error", () => {
  socket.roomnum = "2";
  changeStateServer(debugSocket, state, time, callback);

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "room is null (error server)");
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

  expect(room).toStrictEqual({ host: "1" });
});

it("Not host", () => {
  room.host = "2";
  changeStateServer(debugSocket, state, time, callback);

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "socket is not host");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(room).toStrictEqual({ host: "2" });
});
