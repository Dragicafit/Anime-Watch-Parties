#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioJoinRoom = require("../../src/server/io/ioJoinRoom");
const IoUtils = require("../../src/server/io/ioUtils");

/** @type {ioServer} */
let io;
/** @type {SocketServer} */
let socket;
let joinRoom;

/** @type {jest.Mock} */
let debugSocket;
let roomnum;
/** @type {jest.Mock} */
let callback;

/** @type {IoRoom} */
let room1;
/** @type {IoRoom} */
let room2;
/** @type {Performance} */
let performance;

/** @type {jest.Mock} */
let syncClient;
/** @type {jest.Mock} */
let updateRoomUsers;

beforeEach(() => {
  let rooms = new Set("1");
  socket = {
    on: (event, cb) => {
      if (event === "joinRoom") {
        joinRoom = cb;
      }
    },
    id: "1",
    rooms: rooms,
    join: (roomKey) => {
      rooms.clear();
      rooms.add("1");
      rooms.add(roomKey);
      if (roomKey === "room-roomnum1") {
        if (room1 == null) room1 = {};
        io.sockets.adapter.rooms.set(roomKey, room1);
      } else {
        if (room2 == null) room2 = {};
        io.sockets.adapter.rooms.set(roomKey, room2);
      }
    },
    leave: (roomKey) => {
      io.sockets.adapter.rooms.delete(roomKey);
      if (roomKey === "room-roomnum1") {
        room1 = null;
      } else {
        room2 = null;
      }
    },
  };
  io = {
    sockets: {
      sockets: new Map([[socket.id, socket]]),
      adapter: { rooms: new Map() },
    },
  };
  debugSocket = jest.fn();
  roomnum = "roomnum2";
  callback = jest.fn();

  room2 = null;
  //join room
  room1 = {
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  };
  io.sockets.adapter.rooms.set("room-roomnum1", room1);
  socket.rooms.add("roomnum1");

  syncClient = jest.fn();
  updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));
  performance = { now: jest.fn(() => 5) };

  let ioUtils = new IoUtils(io, socket, performance);
  ioUtils.syncClient = syncClient;
  ioUtils.updateRoomUsers = updateRoomUsers;
  ioJoinRoom.start(ioUtils);
});

it.each(["r", "roomnum_", Array(31).join("x")])(
  "Change room from existing room to new room",
  (roomnum2) => {
    roomnum = roomnum2;
    joinRoom(debugSocket, roomnum, callback);

    expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
    expect(debugSocket).toHaveBeenNthCalledWith(
      2,
      `connected to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
    expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
    expect(callback).toHaveBeenNthCalledWith(1, null, {
      roomnum: roomnum,
      host: true,
    });
    expect(performance.now).toHaveBeenNthCalledWith(1);

    expect(debugSocket).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(room1).toBeNull();
    expect(room2).toStrictEqual({
      currTime: 0,
      currVideo: null,
      host: "1",
      lastChange: 5,
      state: false,
      location: null,
      site: null,
    });
  }
);

it("Change room from non-existing room to new room", () => {
  socket.rooms.delete("roomnum1");
  io.sockets.adapter.rooms.delete("room-roomnum1");
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });
  expect(performance.now).toHaveBeenNthCalledWith(1);

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(room1).toStrictEqual({
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toStrictEqual({
    currTime: 0,
    currVideo: null,
    host: "1",
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  });
});

it("Change room from existing room to existing room", () => {
  room2 = {
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  };
  io.sockets.adapter.rooms.set("room-roomnum2", room2);

  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
  expect(debugSocket).toHaveBeenNthCalledWith(
    2,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(room1).toBeNull();
  expect(room2).toStrictEqual({
    currTime: 0,
    currVideo: null,
    host: "1",
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  });
});

it("Change room from non-existing room to existing room", () => {
  socket.rooms.delete("roomnum1");
  io.sockets.adapter.rooms.delete("room-roomnum1");
  room2 = {
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  };
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });
  expect(performance.now).toHaveBeenNthCalledWith(1);

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(room1).toStrictEqual({
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toStrictEqual({
    currTime: 0,
    currVideo: null,
    host: "1",
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  });
});

it("Change room to same room", () => {
  roomnum = "roomnum1";
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    `connected to room-${roomnum}`
  );
  expect(debugSocket).toHaveBeenNthCalledWith(2, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    roomnum: roomnum,
    host: true,
  });

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(room1).toStrictEqual({
    host: "1",
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toBeNull();
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
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(room1).toStrictEqual({
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toStrictEqual(null);
});

it("With error", () => {
  socket.rooms.delete("roomnum1");
  socket.rooms.add("2");
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "updateRoomUsers");
  expect(debugSocket).toHaveBeenNthCalledWith(2, "connected to room-roomnum2");
  expect(debugSocket).toHaveBeenNthCalledWith(3, "socket is host");
  expect(debugSocket).toHaveBeenNthCalledWith(4, "updateRoomUsers");
  expect(callback).toHaveBeenNthCalledWith(1, null, {
    host: true,
    roomnum: "roomnum2",
  });
  expect(performance.now).toHaveBeenNthCalledWith(1);

  expect(debugSocket).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

  expect(room1).toStrictEqual({
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toStrictEqual({
    currTime: 0,
    currVideo: null,
    host: "1",
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
});

it("With error, same room", () => {
  roomnum = "2";
  socket.rooms.delete("roomnum1");
  socket.rooms.add("2");
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "connected to room-2");
  expect(debugSocket).toHaveBeenNthCalledWith(2, "room is null (error server)");
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

  expect(debugSocket).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(room1).toStrictEqual({
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    location: null,
    site: null,
    state: false,
  });
  expect(room2).toStrictEqual(null);
});
