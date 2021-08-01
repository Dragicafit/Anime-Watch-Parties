import "dotenv/config";

import { Socket as SocketClient, io as ioClient } from "socket.io-client";
import ioServerSetup from "../src/server/ioServerSetup";
import { Server } from "socket.io";
import { IoCallback, supportedEvents } from "../src/server/io/ioConst";

jest.unmock("socket.io");

const portTest = Number(process.env.PORT_TEST) || 4001;
const port = Number(process.env.PORT) !== portTest ? portTest : portTest + 1;

const supportedEventsTest = {
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CHANGE_STATE_SERVER: "changeStateServer",
  CHANGE_VIDEO_SERVER: "changeVideoServer",
  SYNC_CLIENT: "syncClient",
};

let io: Server;

beforeEach(() => {
  io = new Server(port);
  ioServerSetup.start(io);
  return Promise.resolve();
});

afterEach(() => {
  return ioServerSetup.close(io);
});

it("verify supported events", () => {
  expect(supportedEvents).toStrictEqual(supportedEventsTest);
  return Promise.resolve();
});

describe("test argument middleware", function () {
  let socket: SocketClient;

  beforeEach(() => {
    return new Promise<void>((resolve) => {
      socket = ioClient(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
      });
      socket.on("connect", resolve);
    });
  });

  afterEach(() => {
    if (socket?.connected) {
      socket.disconnect();
    } else {
      console.error("no connection to break...");
    }
  });

  it("throw an error", () => {
    return new Promise<void>((resolve) => {
      expect(() => socket.emit("disconnecting")).toThrow(
        new Error('"disconnecting" is a reserved event name')
      );
      resolve();
    });
  });

  it("callbacks error with non existent event", () => {
    return new Promise<void>((resolve) => {
      socket.emit("nonExistent", <IoCallback>((err, data) => {
        expect(err).toBe("event is not valid");
        expect(data).toBeUndefined();
        resolve();
      }));
    });
  });

  it("accepts without data and callback", () => {
    Object.values(supportedEvents).map((supportedEvent) =>
      socket.emit(supportedEvent)
    );
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("accepts without callback", () => {
    Object.values(supportedEvents).map((supportedEvent) =>
      socket.emit(supportedEvent, {})
    );
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("accepts without data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise<void>((resolve) => {
          socket.emit(supportedEvent, <IoCallback>((err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          }));
        });
      })
    );
  });

  it("accepts with undefined data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise<void>((resolve) => {
          socket.emit(supportedEvent, undefined, <IoCallback>((err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          }));
        });
      })
    );
  });

  it("accepts with null data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise<void>((resolve) => {
          socket.emit(supportedEvent, null, <IoCallback>((err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          }));
        });
      })
    );
  });

  it("callback error with invalid data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise<void>((resolve) => {
          socket.emit(supportedEvent, 0, <IoCallback>((err, data) => {
            expect(err).toBe("data is not valid");
            expect(data).toBeUndefined();
            resolve();
          }));
        });
      })
    );
  });
});

describe("test arguments", function () {
  let socket: SocketClient;

  beforeEach((done) => {
    socket = ioClient(`http://localhost:${port}`, {
      reconnectionDelay: 0,
      forceNew: true,
    });
    socket.on("connect", function () {
      done();
    });
  });

  afterEach((done) => {
    if (socket?.connected) {
      socket.disconnect();
    } else {
      console.error("no connection to break...");
    }
    done();
  });

  describe("emit joinRoom", () => {
    it("callback error without roomnum", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: null }, <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("callback error with roomnum empty", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "" }, <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("callback error with roomnum not a word", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "-" }, <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("reaches connection with 1 char", (done) => {
      socket.emit("joinRoom", { roomnum: "_" }, <IoCallback>((err, data) => {
        expect(err).not.toBe("wrong input");
        done();
      }));
    });

    it("reaches connection with 30 char", (done) => {
      socket.emit("joinRoom", { roomnum: "abcabcabcabcabcabcabcabcabcabc" }, <
        IoCallback
      >((err, data) => {
        expect(err).not.toBe("wrong input");
        done();
      }));
    });

    it("callback error with roomnum 31 char", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "abcabcabcabcabcabcabcabcabcabca" }, <
        IoCallback
      >((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("callback error with roomnum not a string", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: 26 }, <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });
  });

  describe("emit changeStateServer", () => {
    it("without data", (done) => {
      socket.emit("changeStateServer", <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("state is null", (done) => {
      socket.emit("changeStateServer", { state: null, time: 20 }, <IoCallback>((
        err,
        data
      ) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("time is null", (done) => {
      socket.emit("changeStateServer", { state: true, time: null }, <
        IoCallback
      >((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });

    it("time is null", (done) => {
      socket.emit(
        "changeStateServer",
        {
          state: true,
          time: 2000000000000000000000000000000000000000000000000,
        },
        <IoCallback>((err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        })
      );
    });

    it("time is null", (done) => {
      socket.emit("changeStateServer", { state: true, time: 20 }, <IoCallback>((
        err,
        data
      ) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });
  });

  describe("emit changeVideoServer", () => {
    it("emit changeVideoServer", (done) => {
      socket.emit(
        "changeVideoServer",
        {
          videoId: "videoId",
          site: "wakanim",
          location: "fr",
        },
        <IoCallback>((err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        })
      );
    });

    it("emit changeVideoServer", (done) => {
      socket.emit(
        "changeVideoServer",
        {
          videoId: "videoId",
          site: "wakanim",
          location: "fr",
        },
        <IoCallback>((err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        })
      );
    });

    it("emit changeVideoServer", (done) => {
      socket.emit(
        "changeVideoServer",
        {
          videoId: "videoId",
          site: "wakanim",
          location: "fr",
        },
        <IoCallback>((err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        })
      );
    });

    it("emit changeVideoServer", (done) => {
      socket.emit(
        "changeVideoServer",
        {
          videoId: "videoId",
          site: "wakanim",
          location: "fr",
        },
        <IoCallback>((err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        })
      );
    });
  });

  describe("emit syncClient", () => {
    it("emit syncClient", (done) => {
      socket.emit("syncClient", <IoCallback>((err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      }));
    });
  });
});

describe("test connection", function () {
  describe("with one socket", function () {
    let socket: SocketClient;

    beforeEach(() => {
      socket = ioClient(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
      });
      return new Promise<void>((resolve) =>
        socket.on("connect", function () {
          resolve();
        })
      );
    });

    afterEach(() => {
      if (socket?.connected) {
        socket.disconnect();
      } else {
        console.error("no connection to break...");
      }
      return Promise.resolve();
    });

    it("number of connections", () => {
      expect(io.sockets.sockets.size).toBe(1);
      return Promise.resolve();
    });

    it("simple connection", () => {
      return new Promise<void>((resolve) =>
        socket.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
          err,
          data
        ) => {
          expect(err).toBeNull();
          expect(data).toEqual({
            host: true,
            roomnum: "roomnum",
            onlineUsers: 1,
            state: false,
            time: 0,
          });
          resolve();
        }))
      ).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)!.size).toBe(1);
      });
    });

    it("get online users", () => {
      return new Promise<void>((resolve) => {
        socket.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
          err,
          data
        ) => {
          expect(err).toBeNull();
          expect(data).toEqual({
            host: true,
            roomnum: "roomnum",
            onlineUsers: 1,
            state: false,
            time: 0,
          });
          resolve();
        }));
      });
    });
  });

  describe("with two sockets", function () {
    let socket1: SocketClient;
    let socket2: SocketClient;

    beforeEach(() => {
      socket1 = ioClient(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
      });
      socket2 = ioClient(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
      });

      return Promise.all([
        new Promise<void>((resolve) =>
          socket1.on("connect", function () {
            resolve();
          })
        ),
        new Promise<void>((resolve) =>
          socket2.on("connect", function () {
            resolve();
          })
        ),
      ]);
    });

    afterEach(() => {
      if (socket1?.connected) {
        socket1.disconnect();
      } else {
        console.error("no connection to break...");
      }
      if (socket2?.connected) {
        socket2.disconnect();
      } else {
        console.error("no connection to break...");
      }
      return Promise.resolve();
    });

    it("number of connections", () => {
      expect(io.sockets.sockets.size).toBe(2);
      return Promise.resolve();
    });

    it("simple connection", () => {
      return Promise.all([
        new Promise<void>((resolve) => {
          socket1.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
            err,
            data
          ) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: true,
              roomnum: "roomnum",
              onlineUsers: 1,
              state: false,
              time: 0,
            });
            resolve();
          }));
        }),
        new Promise<void>((resolve) => {
          socket2.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
            err,
            data
          ) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              roomnum: "roomnum",
              onlineUsers: 2,
              state: false,
              time: 0,
            });
            resolve();
          }));
        }),
      ]).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)!.size).toBe(2);
      });
    });

    it("get online users", () => {
      return Promise.all([
        new Promise<void>((resolve) =>
          socket1.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
            err,
            data
          ) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: true,
              roomnum: "roomnum",
              onlineUsers: 1,
              state: false,
              time: 0,
            });
            resolve();
          }))
        ),

        new Promise<void>((resolve) =>
          socket2.emit("joinRoom", { roomnum: "roomnum" }, <IoCallback>((
            err,
            data
          ) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              roomnum: "roomnum",
              onlineUsers: 2,
              state: false,
              time: 0,
            });
            resolve();
          }))
        ),
        new Promise<void>((resolve) => {
          socket1.on("getUsers", function (data) {
            expect(data.onlineUsers).toBe(2);
            resolve();
          });
        }),
      ]);
    });
  });
});
