#!/usr/bin/env node
"use strict";

const { Socket: SocketServer } = require("socket.io");
const IoContext = require("../../src/server/io/ioContext");
const ioSyncClient = require("../../src/server/io/ioSyncClient");
const IoUtils = require("../../src/server/io/ioUtils");

/** @type {SocketServer} */
let socket;
let syncClient;

/** @type {jest.Mock} */
let syncClientMock;

beforeEach(() => {
  socket = {
    on: (event, cb) => {
      if (event === "syncClient") {
        syncClient = cb;
      }
    },
  };
  syncClientMock = jest.fn();

  let ioContext = new IoContext(null, socket);
  let ioUtils = new IoUtils(ioContext);
  ioUtils.syncClient = syncClientMock;
  ioSyncClient.start(ioContext, ioUtils);
});

it("Valid", () => {
  syncClient();

  expect(syncClientMock).toHaveBeenNthCalledWith(1, undefined, undefined);

  expect(syncClientMock).toHaveBeenCalledTimes(1);
});
