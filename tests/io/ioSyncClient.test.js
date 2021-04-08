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
let syncClient;

/** @type {jest.Mock} */
let syncClientMock;

beforeEach((done) => {
  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      syncClientMock = jest.fn();

      let ioContext = new IoContext(null, socket);
      let ioUtils = new IoUtils(ioContext);
      ioUtils.syncClient = syncClientMock;
      ioSyncClient.start(ioContext, ioUtils);
      syncClient = socket.events.syncClient;
      done();
    }
  );
});

it("Valid", () => {
  syncClient();

  expect(syncClientMock).toHaveBeenNthCalledWith(1, undefined, undefined);

  expect(syncClientMock).toHaveBeenCalledTimes(1);
});
