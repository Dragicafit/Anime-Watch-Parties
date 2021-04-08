#!/usr/bin/env node
"use strict";

const { Server, Socket } = require("socket.io");
const { IoUtils } = require("../../src/server/io/ioUtils");
const { IoRoom } = require("../../src/server/io/ioRoom");
const { IoContext } = require("../../src/server/io/ioContext");

/** @type {Server} */
let io;
/** @type {Socket} */
let socket;

/** @type {jest.Mock} */
let debugSocket;

/** @type {IoUtils} */
let ioUtils;
/** @type {String} */
let roomnum;
/** @type {Performance} */
let performance;

/** @type {jest.Mock} */
let emit;

beforeEach((done) => {
  emit = jest.fn();

  io = new Server();
  socket = io.sockets._add(
    { conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      roomnum = "roomnum";

      performance = { now: jest.fn(() => 5) };

      IoRoom.ioContext = new IoContext(io, null, performance);
      let ioContext = new IoContext(io, socket, performance);
      ioUtils = new IoUtils(ioContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom();
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum).ioRoom = ioRoom;

      debugSocket = jest.fn();

      done();
    }
  );
});

describe("syncClient", () => {
  /** @type {jest.Mock} */
  let callback;

  beforeEach(() => {
    socket.emit = emit;
    callback = jest.fn();

    let ioRoom = ioUtils.getIoRoom(roomnum);
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
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change video client");

    expect(emit).toHaveBeenCalledTimes(2);
    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(performance.now).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        state: true,
        currTime: 0,
        lastChange: 2,
        currVideo: "videoId",
        site: undefined,
        location: undefined,
      },
    });
  });

  it("sync state and video and state is false", () => {
    ioUtils.getIoRoom(roomnum).state = false;
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
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change video client");

    expect(emit).toHaveBeenCalledTimes(2);
    expect(debugSocket).toHaveBeenCalledTimes(3);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        state: false,
        currTime: 0,
        lastChange: 2,
        currVideo: "videoId",
        site: undefined,
        location: undefined,
      },
    });
  });

  it("sync state", () => {
    ioUtils.getIoRoom(roomnum).currVideo = undefined;
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeStateClient", {
      time: 0.003,
      state: true,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledTimes(0);
    expect(performance.now).toHaveBeenCalledTimes(2);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        state: true,
        currTime: 0,
        lastChange: 2,
        currVideo: undefined,
        site: undefined,
        location: undefined,
      },
    });
  });

  it("sync video", () => {
    ioUtils.getIoRoom(roomnum).currTime = undefined;
    ioUtils.getIoRoom(roomnum).state = undefined;
    ioUtils.getIoRoom(roomnum).lastChange = undefined;
    ioUtils.syncClient(debugSocket, callback);

    expect(emit).toHaveBeenNthCalledWith(1, "changeVideoClient", {
      site: undefined,
      videoId: "videoId",
      location: undefined,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        state: undefined,
        currTime: undefined,
        lastChange: undefined,
        currVideo: "videoId",
        site: undefined,
        location: undefined,
      },
    });
  });

  it("Without roomnum", () => {
    socket.leave(`room-${roomnum}`);
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

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });

  it("With error", () => {
    socket.leave(`room-${roomnum}`);
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

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });
});

describe("updateRoomUsers", () => {
  beforeEach(() => {
    socket.emit = emit;

    io.sockets.to = (roomKey) => {
      if (roomKey === `room-${roomnum}`) {
        return { emit: emit };
      }
    };
  });

  it("Valid", () => {
    ioUtils.updateRoomUsers(debugSocket);

    expect(emit).toHaveBeenNthCalledWith(1, "getUsers", {
      onlineUsers: 1,
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );

    expect(emit).toHaveBeenCalledTimes(1);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toStrictEqual(new Set(["socket-1"]));
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

  it("Without roomnum", () => {
    socket.leave(`room-${roomnum}`);
    ioUtils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });

  it("With error", () => {
    socket.leave(`room-${roomnum}`);
    ioUtils.updateRoomUsers(debugSocket);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "socket is not connected to room"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });
});
