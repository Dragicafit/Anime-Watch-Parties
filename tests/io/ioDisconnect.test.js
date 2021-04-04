#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const IoContext = require("../../src/server/io/ioContext");
const ioDisconnect = require("../../src/server/io/ioDisconnect");
const IoRoom = require("../../src/server/io/ioRoom");
const IoUtils = require("../../src/server/io/ioUtils");

/** @type {ioServer} */
let io;
/** @type {SocketServer} */
let socket;
let disconnect;

/** @type {jest.Mock} */
let debugDisconnect;
/** @type {jest.Mock} */
let updateRoomUsers;

/** @type {IoRoom} */
let ioRoom;

beforeEach(() => {
  socket = {
    on: (event, callback) => {
      if (event === "disconnect") {
        disconnect = callback;
      }
    },
    id: "1",
    rooms: new Set("1"),
  };
  io = {
    sockets: {
      sockets: new Map([[socket.id, socket]]),
      adapter: { rooms: new Map() },
    },
  };
  debugDisconnect = jest.fn();
  updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

  IoRoom.ioContext = new IoContext(io, null, { now: () => 5 });

  // join room
  ioRoom = new IoRoom();
  ioRoom.host = "1";
  io.sockets.adapter.rooms.set("room-roomnum", { ioRoom: ioRoom });
  socket.rooms.add("roomnum");

  let ioContext = new IoContext(io, socket);
  let ioUtils = new IoUtils(ioContext);
  ioUtils.updateRoomUsers = updateRoomUsers;
  ioDisconnect.start(ioContext, ioUtils, debugDisconnect);
});

it("With Roomnum and is host", () => {
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    2,
    "1:",
    "applied to room-roomnum"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(3, "1:", "updateRoomUsers");
  expect(updateRoomUsers).toHaveBeenNthCalledWith(1, expect.any(Function));

  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: undefined,
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("With Roomnum and is not host", () => {
  ioRoom.host = "2";
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    2,
    "1:",
    "applied to room-roomnum"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(3, "1:", "updateRoomUsers");
  expect(updateRoomUsers).toHaveBeenNthCalledWith(1, expect.any(Function));

  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(updateRoomUsers).toHaveBeenCalledTimes(1);

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

it("Without Roomnum", () => {
  socket.rooms.delete("roomnum");
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(1);
  expect(updateRoomUsers).toHaveBeenCalledTimes(0);

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

it("With error", () => {
  socket.rooms.delete("roomnum");
  socket.rooms.add("2");
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(1);
  expect(updateRoomUsers).toHaveBeenCalledTimes(0);

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
