#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const ioChangeVideoServer = require("../../src/server/io/ioChangeVideoServer");
const { IoContext } = require("../../src/server/io/ioContext");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoUtils } = require("../../src/server/io/ioUtils");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;
let changeVideoServer;

/** @type {jest.Mock} */
let debugSocket;
/** @type {String} */
let roomnum;
/** @type {String} */
let videoId;
/** @type {String} */
let site;
/** @type {String} */
let location;
/** @type {jest.Mock} */
let callback;

/** @type {jest.Mock} */
let emit;

beforeEach((done) => {
  emit = jest.fn();
  let performance = { now: () => 5 };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  videoId = "videoId";
  site = "wakanim";
  location = "FR";
  callback = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      socket.to = (roomKey) => {
        if (roomKey === `room-${roomnum}`) {
          return { emit: emit };
        }
      };

      IoRoom.ioContext = new IoContext(io, null, performance);
      let ioContext = new IoContext(io, socket);
      ioUtils = new IoUtils(ioContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom();
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      ioChangeVideoServer.start(ioContext, ioUtils);
      changeVideoServer = socket.events.changeVideoServer;
      done();
    }
  );
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
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
    videoId: videoId,
    site: site,
    location: location,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(0);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: videoId,
      site: site,
      location: location,
    },
  });
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
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
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
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "videoId is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
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
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "site is not a valid string");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
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
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "location is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toMatchObject({
    ioRoom: {
      host: "socket-1",
      state: false,
      currTime: 0,
      lastChange: 5,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    },
  });
});

it("Not connected to a room", () => {
  socket.leave(`room-${roomnum}`);
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
});

it("With error", () => {
  socket.leave(`room-${roomnum}`);
  socket.join(roomnum);
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "socket is not connected to room"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

  expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  expect(io.sockets.adapter.rooms.get(roomnum)).toStrictEqual(
    new Set(["socket-1"])
  );
});

it("Not host", () => {
  ioUtils.getIoRoom(roomnum).host = "2";
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "socket is not host");
  expect(callback).toHaveBeenNthCalledWith(1, "access denied");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

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
