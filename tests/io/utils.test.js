#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket } = require("socket.io");
const Utils = require("../../src/server/io/utils");
const Room = require("../../src/server/io/room");

/** @type {ioServer} */
let io;
/** @type {Socket} */
let socket;
/** @type {Utils} */
let utils;

/** @type {jest.Mock} */
let debugSocket;

/** @type {Room} */
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

  // join room
  room = { host: "1" };
  io.sockets.adapter.rooms.set("room-roomnum", room);
  socket.rooms.add("roomnum");

  debugSocket = jest.fn();
  performance = { now: jest.fn(() => 5) };

  utils = new Utils(io, socket, performance);
});

describe("syncClient", () => {
  /** @type {jest.Mock} */
  let callback;

  beforeEach(() => {
    socket.emit = emit;
    callback = jest.fn();

    room = {
      host: "1",
      currTime: 0,
      currVideo: "videoId",
      state: true,
      lastChange: 10,
    };
    io.sockets.adapter.rooms.set("room-roomnum", room);
  });

  it("sync state and video and state is true", () => {
    utils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: -0.005,
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
    expect(performance.now).toHaveBeenNthCalledWith(1);

    expect(emit).toHaveBeenCalledTimes(2);
    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({
      host: "1",
      currTime: 0,
      currVideo: "videoId",
      state: true,
      lastChange: 10,
    });
  });

  it("sync state and video and state is false", () => {
    room.state = false;
    utils.syncClient(debugSocket, callback);

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
    expect(performance.now).toHaveBeenCalledTimes(0);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({
      host: "1",
      currTime: 0,
      currVideo: "videoId",
      state: false,
      lastChange: 10,
    });
  });

  it("sync state", () => {
    delete room.currVideo;
    utils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: -0.005,
      state: true,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");
    expect(performance.now).toHaveBeenNthCalledWith(1);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({
      host: "1",
      currTime: 0,
      state: true,
      lastChange: 10,
    });
  });

  it("sync video", () => {
    delete room.currTime;
    delete room.state;
    delete room.lastChange;
    utils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
      site: undefined,
      videoId: "videoId",
      location: undefined,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(performance.now).toHaveBeenCalledTimes(0);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({
      host: "1",
      currVideo: "videoId",
    });
  });

  it("Without roomnum", () => {
    socket.rooms.delete("roomnum");
    utils.syncClient(debugSocket, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );
    expect(callback).toHaveBeenNthCalledWith(1, "access denied");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(0);
    expect(callback).toHaveBeenCalledTimes(1);

    expect(room).toStrictEqual({
      host: "1",
      currTime: 0,
      currVideo: "videoId",
      state: true,
      lastChange: 10,
    });
  });

  it("With error", () => {
    io.sockets.adapter.rooms.delete("room-roomnum");
    utils.syncClient(debugSocket, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );
    expect(callback).toHaveBeenNthCalledWith(1, "access denied");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(0);
    expect(callback).toHaveBeenCalledTimes(1);

    expect(room).toStrictEqual({
      host: "1",
      currTime: 0,
      currVideo: "videoId",
      state: true,
      lastChange: 10,
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
    utils.updateRoomUsers(debugSocket);

    expect(emit).toHaveBeenNthCalledWith(1, "getUsers", {
      onlineUsers: 1,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(1, "applied to room-roomnum");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({ size: 1 });
  });

  it("Without roomnum", () => {
    socket.rooms.delete("roomnum");
    utils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({ size: 1 });
  });

  it("With error", () => {
    io.sockets.adapter.rooms.delete("room-roomnum");
    utils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(0);

    expect(room).toStrictEqual({ size: 1 });
  });
});
