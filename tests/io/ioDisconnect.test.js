#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioDisconnect = require("../../src/server/io/ioDisconnect");

/** @type {ioServer} */
let io;
/** @type {SocketServer} */
let socket;
let disconnect;

/** @type {jest.Mock} */
let debugDisconnect;
/** @type {jest.Mock} */
let updateRoomUsers;

let room;

beforeEach(() => {
  socket = {
    on: (event, callback) => {
      if (event === "disconnect") {
        disconnect = callback;
      }
    },
    id: "1",
    roomnum: "roomnum",
  };
  io = {
    sockets: {
      sockets: new Map([[socket.id, socket]]),
      adapter: { rooms: new Map() },
    },
  };
  debugDisconnect = jest.fn();
  updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

  room = { host: "1" };

  ioDisconnect.start(io, socket, debugDisconnect, updateRoomUsers);
});

it("Without Roomnum", () => {
  socket.roomnum = null;
  disconnect();

  expect(debugDisconnect).toHaveBeenCalledTimes(1);
  expect(updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );

  expect(room).toStrictEqual({ host: "1" });
});

it("With Roomnum and is not host", () => {
  room.host = "2";
  io.sockets.adapter.rooms.set("room-roomnum", room);
  disconnect();
  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(updateRoomUsers).toHaveBeenCalledTimes(1);

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

  expect(room).toStrictEqual({ host: "2" });
});

it("With Roomnum and is host", () => {
  room.host = "1";
  io.sockets.adapter.rooms.set("room-roomnum", room);
  disconnect();
  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(updateRoomUsers).toHaveBeenCalledTimes(1);

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

  expect(room).toStrictEqual({ host: undefined });
});

it("With error", () => {
  ioDisconnect.start(io, socket, debugDisconnect, updateRoomUsers);
  socket.roomnum = "roomnum";
  disconnect();
  expect(debugDisconnect).toHaveBeenCalledTimes(2);
  expect(updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "1:",
    "1 sockets connected"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    2,
    "1:",
    "room is null (empty room)"
  );

  expect(room).toStrictEqual({ host: "1" });
});