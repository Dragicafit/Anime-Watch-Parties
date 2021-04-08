#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const { SocketContext } = require("../../src/server/io/ioContext");
const ioLeaveRoom = require("../../src/server/io/ioLeaveRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;
let leaveRoom;

/** @type {jest.Mock} */
let debugSocket;
/** @type {String} */
let roomnum;
/** @type {jest.Mock} */
let callback;

beforeEach((done) => {
  debugSocket = jest.fn();
  roomnum = "roomnum";
  callback = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(null, socket);
      ioUtils = new IoUtils(socketContext);
      ioUtils.leaveRoom = jest.fn();

      ioLeaveRoom.start(socketContext, ioUtils);
      leaveRoom = socket.events.leaveRoom;
      done();
    }
  );
});

it("Valid", () => {
  leaveRoom(debugSocket, roomnum, callback);

  expect(ioUtils.leaveRoom).toHaveBeenNthCalledWith(1, debugSocket, roomnum);

  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(ioUtils.leaveRoom).toHaveBeenCalledTimes(1);
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
  leaveRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.leaveRoom).toHaveBeenCalledTimes(0);
});
