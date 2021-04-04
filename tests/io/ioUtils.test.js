#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket } = require("socket.io");
const IoUtils = require("../../src/server/io/ioUtils");
const IoRoom = require("../../src/server/io/ioRoom");
const IoContext = require("../../src/server/io/ioContext");

/** @type {ioServer} */
let io;
/** @type {Socket} */
let socket;
/** @type {IoUtils} */
let ioUtils;

/** @type {jest.Mock} */
let debugSocket;

/** @type {IoRoom} */
let ioRoom;
/** @type {Set<string>} */
let room;
/** @type {Performance} */
let performance;

/** @type {jest.Mock} */
let emit;

beforeEach(() => {
  emit = jest.fn();

  socket = {
    rooms: new Set("1"),
  };
  io = {
    sockets: {
      adapter: { rooms: new Map() },
    },
  };

  performance = { now: jest.fn(() => 5) };

  IoRoom.ioContext = new IoContext(io, null, performance);

  // join room
  ioRoom = new IoRoom();
  ioRoom.host = "1";
  room = { ioRoom: ioRoom };
  io.sockets.adapter.rooms.set("room-roomnum", room);
  socket.rooms.add("roomnum");

  debugSocket = jest.fn();

  let ioContext = new IoContext(io, socket, performance);
  ioUtils = new IoUtils(ioContext);
});

describe("syncClient", () => {
  /** @type {jest.Mock} */
  let callback;

  beforeEach(() => {
    socket.emit = emit;
    callback = jest.fn();

    ioRoom.state = true;
    ioRoom.currTime = 0;
    ioRoom.lastChange = 2;
    ioRoom.currVideo = "videoId";
  });

  it("sync state and video and state is true", () => {
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: 0.003,
      state: true,
    });
    expect(emit).toHaveBeenNthCalledWith(2, "changeVideoClient", {
      site: undefined,
      videoId: "videoId",
      location: undefined,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change video client");

    expect(emit).toHaveBeenCalledTimes(2);
    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(performance.now).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: true,
      currTime: 0,
      lastChange: 2,
      currVideo: "videoId",
      site: undefined,
      location: undefined,
    });
  });

  it("sync state and video and state is false", () => {
    ioRoom.state = false;
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: 0,
      state: false,
    });
    expect(emit).toHaveBeenNthCalledWith(2, "changeVideoClient", {
      site: undefined,
      videoId: "videoId",
      location: undefined,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change video client");

    expect(emit).toHaveBeenCalledTimes(2);
    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: false,
      currTime: 0,
      lastChange: 2,
      currVideo: "videoId",
      site: undefined,
      location: undefined,
    });
  });

  it("sync state", () => {
    ioRoom.currVideo = undefined;
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: 0.003,
      state: true,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledTimes(0);
    expect(performance.now).toHaveBeenCalledTimes(2);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: true,
      currTime: 0,
      lastChange: 2,
      currVideo: undefined,
      site: undefined,
      location: undefined,
    });
  });

  it("sync video", () => {
    ioRoom.currTime = undefined;
    ioRoom.state = undefined;
    ioRoom.lastChange = undefined;
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
      site: undefined,
      videoId: "videoId",
      location: undefined,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: undefined,
      currTime: undefined,
      lastChange: undefined,
      currVideo: "videoId",
      site: undefined,
      location: undefined,
    });
  });

  it("Without roomnum", () => {
    socket.rooms.delete("roomnum");
    ioUtils.syncClient(debugSocket, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );
    expect(callback).toHaveBeenNthCalledWith(1, "access denied");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: true,
      currTime: 0,
      lastChange: 2,
      currVideo: "videoId",
      site: undefined,
      location: undefined,
    });
  });

  it("With error", () => {
    io.sockets.adapter.rooms.delete("room-roomnum");
    ioUtils.syncClient(debugSocket, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );
    expect(callback).toHaveBeenNthCalledWith(1, "access denied");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    expect(ioRoom).toMatchObject({
      host: "1",
      state: true,
      currTime: 0,
      lastChange: 2,
      currVideo: "videoId",
      site: undefined,
      location: undefined,
    });
  });
});

describe("updateRoomUsers", () => {
  beforeEach(() => {
    socket.emit = emit;

    room = {
      size: 1,
    };
    io.sockets.adapter.rooms.set("room-roomnum", room);
    io.sockets.to = (roomKey) => {
      if (roomKey === "room-roomnum") {
        return { emit: emit };
      }
    };
  });

  it("Valid", () => {
    ioUtils.updateRoomUsers(debugSocket);

    expect(emit).toHaveBeenNthCalledWith(1, "getUsers", {
      onlineUsers: 1,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(room).toStrictEqual({ size: 1 });
  });

  it("Without roomnum", () => {
    socket.rooms.delete("roomnum");
    ioUtils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(room).toStrictEqual({ size: 1 });
  });

  it("With error", () => {
    io.sockets.adapter.rooms.delete("room-roomnum");
    ioUtils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(room).toStrictEqual({ size: 1 });
  });
});
