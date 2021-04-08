#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const { IoContext } = require("../../src/server/io/ioContext");
const ioSyncClient = require("../../src/server/io/ioSyncClient");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;
let syncClient;

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
      let ioContext = new IoContext(null, socket);
      ioUtils = new IoUtils(ioContext);
      ioUtils.syncClient = jest.fn();

      ioSyncClient.start(ioContext, ioUtils);
      syncClient = socket.events.syncClient;
      done();
    }
  );
});

it("Valid", () => {
  syncClient(debugSocket, roomnum, callback);

  expect(ioUtils.syncClient).toHaveBeenNthCalledWith(
    1,
    debugSocket,
    roomnum,
    callback
  );

  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(1);
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
  syncClient(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(ioUtils.syncClient).toHaveBeenCalledTimes(0);
});
