#!/usr/bin/env node
"use strict";

const { Socket: SocketServer } = require("socket.io");
const ioSyncClient = require("../../src/server/io/ioSyncClient");
const Utils = require("../../src/server/io/utils");

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

  let utils = new Utils(null, socket);
  utils.syncClient = syncClientMock;
  ioSyncClient.start(utils);
});

it("Valid", () => {
  syncClient();

  expect(syncClientMock).toHaveBeenNthCalledWith(1, undefined, undefined);

  expect(syncClientMock).toHaveBeenCalledTimes(1);
});
