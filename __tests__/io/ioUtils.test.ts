import { Server, Socket } from "socket.io";
import { IoUtils } from "../../src/server/io/ioUtils";
import { IoRoom } from "../../src/server/io/ioRoom";
import { IoContext, SocketContext } from "../../src/server/io/ioContext";
import { Performance } from "perf_hooks";

let io: Server;
let socket: Socket;
let ioUtils: IoUtils;

let debugSocket: jest.Mock;
let roomnum: string;
let callback: jest.Mock;

let performance: Performance;
let emit: jest.Mock;

beforeEach((done) => {
  emit = jest.fn();
  performance = <any>{ now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  roomnum = "roomnum";
  callback = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(io, performance);
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket, performance);
      ioUtils = new IoUtils(socketContext);

      // join room
      socket.join(`room-${roomnum}`);
      let ioRoom = new IoRoom(roomnum);
      ioRoom.host = "socket-1";
      ioUtils.getRoom(roomnum)!.ioRoom = ioRoom;

      done();
    }
  );
});

describe("syncClient", () => {
  beforeEach(() => {
    socket.emit = emit;

    let ioRoom = ioUtils.getIoRoom(roomnum)!;
    ioRoom.state = true;
    ioRoom.currTime = 0;
    ioRoom.lastChange = 2;
    ioRoom.currVideo = "videoId";
  });

  it("sync state and video and state is true", () => {
    let toCallback = {};
    ioUtils.syncClient(debugSocket, roomnum, callback, toCallback);

    expect(toCallback).toEqual({
      roomnum: roomnum,
      videoId: "videoId",
      time: 0.003,
      state: true,
      messages: [],
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change state client");

    expect(emit).toHaveBeenCalledTimes(0);
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
      },
    });
  });

  it("sync state and video and state is false", () => {
    ioUtils.getIoRoom(roomnum)!.state = false;
    let toCallback = {};
    ioUtils.syncClient(debugSocket, roomnum, callback, toCallback);

    expect(toCallback).toStrictEqual({
      location: undefined,
      roomnum: roomnum,
      site: undefined,
      videoId: "videoId",
      time: 0,
      state: false,
      messages: [],
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");
    expect(debugSocket).toHaveBeenNthCalledWith(3, "change state client");

    expect(emit).toHaveBeenCalledTimes(0);
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
      },
    });
  });

  it("sync state", () => {
    ioUtils.getIoRoom(roomnum)!.currVideo = undefined;
    let toCallback = {};
    ioUtils.syncClient(debugSocket, roomnum, callback, toCallback);

    expect(toCallback).toStrictEqual({
      roomnum: roomnum,
      time: 0.003,
      state: true,
      messages: [],
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change state client");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledTimes(0);
    expect(performance.now).toHaveBeenCalledTimes(2);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        state: true,
        currTime: 0,
        lastChange: 2,
      },
    });
  });

  it("sync video", () => {
    ioUtils.getIoRoom(roomnum)!.currTime = <any>undefined;
    ioUtils.getIoRoom(roomnum)!.state = <any>undefined;
    ioUtils.getIoRoom(roomnum)!.lastChange = <any>undefined;
    let toCallback = {};
    ioUtils.syncClient(debugSocket, roomnum, callback, toCallback);

    expect(toCallback).toStrictEqual({
      roomnum: roomnum,
      site: undefined,
      videoId: "videoId",
      location: undefined,
      messages: [],
    });
    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      `applied to room-${roomnum}`
    );
    expect(debugSocket).toHaveBeenNthCalledWith(2, "change video client");

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(2);
    expect(performance.now).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    expect(ioUtils.getRoom(roomnum)).toMatchObject({
      ioRoom: {
        host: "socket-1",
        currVideo: "videoId",
      },
    });
  });

  it("Without roomnum", () => {
    socket.leave(`room-${roomnum}`);
    ioUtils.syncClient(debugSocket, roomnum, callback);

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
    ioUtils.syncClient(debugSocket, roomnum, callback);

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
    socket.to = <any>((roomKey: string) => {
      if (roomKey === `room-${roomnum}`) {
        return { emit: emit };
      }
    });
  });

  it("Valid", () => {
    ioUtils.updateRoomUsers(debugSocket, roomnum);

    expect(emit).toHaveBeenNthCalledWith(1, "getUsers", {
      roomnum: roomnum,
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
      },
    });
  });

  it("Without roomnum", () => {
    socket.leave(`room-${roomnum}`);
    ioUtils.updateRoomUsers(debugSocket, roomnum);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "room-roomnum has been deleted"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });

  it("With error", () => {
    socket.leave(`room-${roomnum}`);
    ioUtils.updateRoomUsers(debugSocket, roomnum);

    expect(debugSocket).toHaveBeenNthCalledWith(
      1,
      "room-roomnum has been deleted"
    );

    expect(emit).toHaveBeenCalledTimes(0);
    expect(debugSocket).toHaveBeenCalledTimes(1);
    expect(performance.now).toHaveBeenCalledTimes(1);

    expect(ioUtils.getRoom(roomnum)).toBeUndefined();
  });
});
