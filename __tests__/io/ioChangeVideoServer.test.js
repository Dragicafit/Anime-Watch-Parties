#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const ioChangeVideoServer = require("../../src/server/io/ioChangeVideoServer");
const { IoContext, SocketContext } = require("../../src/server/io/ioContext");
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
  IoRoom.ioContext = new IoContext(io, performance);
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      socket.to = (roomKey) => {
        if (roomKey === `room-${roomnum}`) {
          return { emit: emit };
        }
      };

      let socketContext = new SocketContext(io, socket);
      ioUtils = new IoUtils(socketContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom(roomnum);
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      ioChangeVideoServer.start(socketContext, ioUtils);
      changeVideoServer = socket.events.changeVideoServer;
      done();
    }
  );
});

it.each([
  ["videoId", "wakanim", "FR"],
  ["v", "wakanim", "US"],
  ["videoId", "wakanim", "us"],
  ["videoId", "wakanim", "uS"],
  ["videoId", "crunchyroll", "US"],
  ["videoId", "crunchyroll", null],
  ["videoId", "crunchyroll", undefined],
  [Array(301).join("x"), "wakanim", "US"],
  ["dr-stone/episode-11-prologue-of-dr-stone-801916", "crunchyroll", null],
  ["11396", "wakanim", "FR"],
])("Valid", (videoId2, site2, location2) => {
  videoId = videoId2;
  site = site2;
  location = location2;
  changeVideoServer(debugSocket, roomnum, videoId, site, location, callback);
  if (site === "crunchyroll") {
    location = null;
  }

  expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
    roomnum: roomnum,
    videoId: videoId,
    site: site,
    location: location,
  });
  expect(debugSocket).toHaveBeenNthCalledWith(1, `applied to room-${roomnum}`);
  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(1);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);

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
])("With invalid site", (site2) => {
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
