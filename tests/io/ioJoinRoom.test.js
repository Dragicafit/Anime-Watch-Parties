#!/usr/bin/env node
"use strict";

const { Server: ioServer, Socket: SocketServer } = require("socket.io");
const ioJoinRoom = require("../../src/server/io/ioJoinRoom");

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

let room1;
let room2;
let performance;

/** @type {jest.Mock} */
let debugDisconnect;
/** @type {jest.Mock} */
let syncClient;
/** @type {jest.Mock} */
let updateRoomUsers;

beforeEach(() => {
  socket = {
    on: (event, cb) => {
      if (event === "joinRoom") {
        joinRoom = cb;
      }
    },
    id: "1",
    roomnum: "roomnum1",
    join: (roomKey) => {
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

  room1 = {
    currTime: 0,
    currVideo: null,
    lastChange: 5,
    state: false,
    location: null,
    site: null,
  };
  room2 = null;
  io.sockets.adapter.rooms.set("room-roomnum1", room1);

  debugDisconnect = jest.fn();
  syncClient = jest.fn();
  updateRoomUsers = jest.fn((cb) => cb("updateRoomUsers"));
  performance = { now: jest.fn(() => 5) };

  ioJoinRoom.start(io, socket, syncClient, updateRoomUsers, performance);
});

it.each(["r", "roomnum_", Array(31).join("x")])(
  "Change room from existing room to new room",
  (roomnum2) => {
    roomnum = roomnum2;
    joinRoom(debugSocket, roomnum, callback);

    expect(debugSocket).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

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
  socket.roomnum = null;
  io.sockets.adapter.rooms.delete("room-roomnum1");
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

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

  expect(debugSocket).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

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
  socket.roomnum = null;
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

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(1);

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

  expect(debugSocket).toHaveBeenCalledTimes(3);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

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

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "roomnum is not a valid string"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

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
  socket.roomnum = "2";
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "room is null (error server)");
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

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

it("With error, same room", () => {
  roomnum = "2";
  socket.roomnum = "2";
  joinRoom(debugSocket, roomnum, callback);

  expect(debugSocket).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "connected to room-2");
  expect(debugSocket).toHaveBeenNthCalledWith(2, "room is null (error server)");
  expect(callback).toHaveBeenNthCalledWith(1, "error server");

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
