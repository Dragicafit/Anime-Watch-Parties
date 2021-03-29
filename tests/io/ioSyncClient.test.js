#!/usr/bin/env node
"use strict";

const { Socket: SocketServer } = require("socket.io");
const ioSyncClient = require("../../src/server/io/ioSyncClient");

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

  ioSyncClient.start(socket, syncClientMock);
});

it("Valid", () => {
  syncClient();

  expect(syncClientMock).toHaveBeenCalledTimes(1);

  expect(syncClientMock).toHaveBeenNthCalledWith(1);
});
