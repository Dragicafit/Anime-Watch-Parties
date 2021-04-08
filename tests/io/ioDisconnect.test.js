#!/usr/bin/env node
"use strict";

const { Server: Server, Socket: Socket } = require("socket.io");
const { IoContext } = require("../../src/server/io/ioContext");
const ioDisconnect = require("../../src/server/io/ioDisconnect");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
let disconnect;

/** @type {IoUtils} */
let ioUtils;
/** @type {String} */
let roomnum;

/** @type {jest.Mock} */
let debugDisconnect;

beforeEach((done) => {
  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      roomnum = "roomnum";
      debugDisconnect = jest.fn();

      IoRoom.ioContext = new IoContext(io, null, { now: () => 5 });
      let ioContext = new IoContext(io, socket);
      ioUtils = new IoUtils(ioContext);
      ioUtils.updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom();
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      ioDisconnect.start(ioContext, ioUtils, debugDisconnect);
      disconnect = socket.events.disconnect;
      done();
    }
  );
});

it("With Roomnum and is host", () => {
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: undefined,
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
  });
});

it("With Roomnum and is not host", () => {
  ioUtils.getIoRoom(roomnum).host = "2";
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    2,
    "socket-1:",
    `applied to room-${roomnum}`
  );
  expect(debugDisconnect).toHaveBeenNthCalledWith(
    3,
    "socket-1:",
    "updateRoomUsers"
  );
  expect(ioUtils.updateRoomUsers).toHaveBeenNthCalledWith(
    1,
    expect.any(Function),
    roomnum
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(3);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "2",
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
  });
});

it("Without Roomnum", () => {
  socket.leave(`room-${roomnum}`);
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With error", () => {
  socket.leave(`room-${roomnum}`);
  socket.join(roomnum);
  disconnect();

  expect(debugDisconnect).toHaveBeenNthCalledWith(
    1,
    "socket-1:",
    "1 sockets connected"
  );

  expect(debugDisconnect).toHaveBeenCalledTimes(1);
  expect(ioUtils.updateRoomUsers).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
});
