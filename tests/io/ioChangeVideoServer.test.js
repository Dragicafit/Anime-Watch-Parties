#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioChangeVideoServer = require("../../src/server/io/ioChangeVideoServer");
const IoRoom = require("../../src/server/io/ioRoom");
const IoUtils = require("../../src/server/io/ioUtils");

/** @type {ioServer} */
let io;
/** @type {SocketServer} */
let socket;
let changeVideoServer;

/** @type {jest.Mock} */
let debugSocket;
let videoId;
let site;
let location;
/** @type {jest.Mock} */
let callback;

/** @type {IoRoom} */
let ioRoom;
/** @type {jest.Mock} */
let emit;

beforeEach(() => {
  emit = jest.fn();
  socket = {
    on: (event, cb) => {
      if (event === "changeVideoServer") {
        changeVideoServer = cb;
      }
    },
    id: "1",
    rooms: new Set("1"),
    broadcast: {
      to: (roomKey) => {
        if (roomKey === "room-roomnum") {
          return { emit: emit };
        }
      },
    },
  };
  io = {
    sockets: {
      sockets: new Map([[socket.id, socket]]),
      adapter: { rooms: new Map() },
    },
  };
  debugSocket = jest.fn();
  videoId = "videoId";
  site = "wakanim";
  location = "FR";
  callback = jest.fn();

  // join room
  ioRoom = new IoRoom({ performance: { now: () => 5 } });
  ioRoom.host = "1";
  io.sockets.adapter.rooms.set("room-roomnum", { ioRoom: ioRoom });
  socket.rooms.add("roomnum");

  ioChangeVideoServer.start(new IoUtils(io, socket));
});

it.each([
  ["videoId", "wakanim", "FR"],
  ["v", "crunchyroll", "US"],
  ["dr-stone/episode-11-prologue-of-dr-stone-801916", "wakanim", "us"],
  [Array(301).join("x"), "wakanim", "uS"],
])("Valid", (videoId2, site2, location2) => {
  videoId = videoId2;
  site = site2;
  location = location2;
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
    videoId: videoId,
    site: site,
    location: location,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(0);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: videoId,
    site: site,
    location: location,
  });
});

it.each([
  null,
  undefined,
  "",
  Array(302).join("x"),
  Infinity,
  NaN,
  0,
  true,
  [""],
  () => {},
  function a() {},
])("With invalid videoId", (videoId2) => {
  videoId = videoId2;
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "videoId is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it.each([
  null,
  undefined,
  "wakavim",
  "crunchyboll",
  "crunchyroll ",
  Infinity,
  NaN,
  true,
  0,
  [""],
  () => {},
  function a() {},
])("With invalid time", (site2) => {
  site = site2;
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "site is not a valid string");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it.each([
  null,
  undefined,
  "ée",
  "e ",
  "e2",
  "f",
  "fr ",
  "fra",
  Infinity,
  NaN,
  true,
  0,
  [""],
  () => {},
  function a() {},
])("With invalid time", (location2) => {
  location = location2;
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "location is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("Not connected to a room", () => {
  socket.rooms.delete("roomnum");
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("With error", () => {
  socket.rooms.delete("roomnum");
  socket.rooms.add("2");
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "1",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});

it("Not host", () => {
  ioRoom.host = "2";
  changeVideoServer(debugSocket, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "socket is not host");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioRoom).toMatchObject({
    host: "2",
    state: false,
    currTime: 0,
    lastChange: 5,
    currVideo: undefined,
    site: undefined,
    location: undefined,
  });
});
