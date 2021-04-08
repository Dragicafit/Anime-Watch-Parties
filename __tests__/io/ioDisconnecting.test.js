#!/usr/bin/env node
"use strict";

const { Server: Server, Socket: Socket } = require("socket.io");
const { IoContext, SocketContext } = require("../../src/server/io/ioContext");
const ioDisconnecting = require("../../src/server/io/ioDisconnecting");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
let disconnecting;

/** @type {IoUtils} */
let ioUtils;
/** @type {String} */
let roomnum;

/** @type {jest.Mock} */
let debugDisconnecting;

beforeEach((done) => {
  roomnum = "roomnum";
  debugDisconnecting = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(io, { now: () => 5 });
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket);
      ioUtils = new IoUtils(socketContext);
      ioUtils.updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom();
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      ioDisconnecting.start(socketContext, ioUtils, debugDisconnecting);
      disconnecting = socket.events.disconnecting;
      done();
    }
  );
});

it("With Roomnum and is host", () => {
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With Roomnum and is not host", () => {
  ioUtils.getIoRoom(roomnum).host = "2";
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("Without Roomnum", () => {
  socket.leave(`room-${roomnum}`);
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With error", () => {
  socket.leave(`room-${roomnum}`);
  socket.join(roomnum);
  disconnecting();

  expect(debugDisconnecting).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnecting).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
  expect(io.sockets.adapter.rooms.get(roomnum).ioRoom).toBeUndefined();
  // the room will be destroyed on disconnect
});
