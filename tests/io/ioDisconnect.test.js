#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
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
let room;

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

  // join room
  room = { host: "1" };
  io.sockets.adapter.rooms.set("room-roomnum", room);
  socket.rooms.add("roomnum");

  let ioUtils = new IoUtils(io, socket, null);
  ioUtils.updateRoomUsers = updateRoomUsers;
  ioDisconnect.start(ioUtils, debugDisconnect);
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

  expect(room).toStrictEqual({ host: undefined });
});

it("With Roomnum and is not host", () => {
  room.host = "2";
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

  expect(room).toStrictEqual({ host: "2" });
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

  expect(room).toStrictEqual({ host: "1" });
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

  expect(room).toStrictEqual({ host: "1" });
});
