#!/usr/bin/env node
"use strict";

require("dotenv").config();

const { Socket: SocketClient, io: ioClient } = require("socket.io-client");
const ioServerSetup = require("../src/server/ioServerSetup");
const { Server } = require("socket.io");
jest.unmock("socket.io");

const portTest = process.env.PORT_TEST || 4001;
const port = process.env.PORT != portTest ? portTest : portTest + 1;

const supportedEvents = {
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CHANGE_STATE_SERVER: "changeStateServer",
  CHANGE_VIDEO_SERVER: "changeVideoServer",
  SYNC_CLIENT: "syncClient",
};

/** @type {Server} */
let io;

beforeEach(() => {
  io = new Server(port);
  ioServerSetup.start(io);
  return Promise.resolve();
});

afterEach(() => {
  return ioServerSetup.close(io);
});

it("verify supported events", () => {
  expect(ioServerSetup.supportedEvents).toStrictEqual(supportedEvents);
  return Promise.resolve();
});

describe("test argument middleware", function () {
  /** @type {SocketClient} */
  let socket;

  beforeEach(() => {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
      expect(() => socket.emit("disconnecting")).toThrow(
        new Error('"disconnecting" is a reserved event name')
      );
      resolve();
    });
  });

  it("callbacks error with non existent event", () => {
    return new Promise((resolve) => {
      socket.emit("nonExistent", (err, data) => {
        expect(err).toBe("event is not valid");
        expect(data).toBeUndefined();
        resolve();
      });
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
        return new Promise((resolve) => {
          socket.emit(supportedEvent, (err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          });
        });
      })
    );
  });

  it("accepts with undefined data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise((resolve) => {
          socket.emit(supportedEvent, undefined, (err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          });
        });
      })
    );
  });

  it("accepts with null data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise((resolve) => {
          socket.emit(supportedEvent, null, (err, data) => {
            expect(err).not.toBe("data is not valid");
            expect(err).not.toBe("event is not valid");
            resolve();
          });
        });
      })
    );
  });

  it("callback error with invalid data", () => {
    return Promise.all(
      Object.values(supportedEvents).map((supportedEvent) => {
        return new Promise((resolve) => {
          socket.emit(supportedEvent, 0, (err, data) => {
            expect(err).toBe("data is not valid");
            expect(data).toBeUndefined();
            resolve();
          });
        });
      })
    );
  });
});

describe("test arguments", function () {
  /** @type {SocketClient} */
  let socket;

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
      socket.emit("joinRoom", { roomnum: null }, (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("callback error with roomnum empty", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "" }, (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("callback error with roomnum not a word", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "-" }, (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("reaches connection with 1 char", (done) => {
      socket.emit("joinRoom", { roomnum: "_" }, (err, data) => {
        expect(err).not.toBe("wrong input");
        done();
      });
    });

    it("reaches connection with 30 char", (done) => {
      socket.emit(
        "joinRoom",
        { roomnum: "abcabcabcabcabcabcabcabcabcabc" },
        (err, data) => {
          expect(err).not.toBe("wrong input");
          done();
        }
      );
    });

    it("callback error with roomnum 31 char", (done) => {
      expect.assertions(2);
      socket.emit(
        "joinRoom",
        { roomnum: "abcabcabcabcabcabcabcabcabcabca" },
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
    });

    it("callback error with roomnum not a string", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: 26 }, (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });
  });

  describe("emit changeStateServer", () => {
    it("without data", (done) => {
      socket.emit("changeStateServer", (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("state is null", (done) => {
      socket.emit(
        "changeStateServer",
        { state: null, time: 20 },
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
    });

    it("time is null", (done) => {
      socket.emit(
        "changeStateServer",
        { state: true, time: null },
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
    });

    it("time is null", (done) => {
      socket.emit(
        "changeStateServer",
        {
          state: true,
          time: 2000000000000000000000000000000000000000000000000,
        },
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
    });

    it("time is null", (done) => {
      socket.emit(
        "changeStateServer",
        { state: true, time: 20 },
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
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
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
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
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
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
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
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
        (err, data) => {
          expect(err).toBe("wrong input");
          expect(data).toBeUndefined();
          done();
        }
      );
    });
  });

  describe("emit syncClient", () => {
    it("emit syncClient", (done) => {
      socket.emit("syncClient", (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });
  });
});

describe("test connection", function () {
  describe("with one socket", function () {
    /** @type {SocketClient} */
    let socket;

    beforeEach(() => {
      socket = ioClient(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
      });
      return new Promise((resolve) =>
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
      return new Promise((resolve) =>
        socket.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
          expect(err).toBeNull();
          expect(data).toEqual({
            host: true,
            roomnum: "roomnum",
            onlineUsers: 1,
            state: false,
            time: 0,
          });
          resolve();
        })
      ).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`).size).toBe(1);
      });
    });

    it("get online users", () => {
      return new Promise((resolve) => {
        socket.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
          expect(err).toBeNull();
          expect(data).toEqual({
            host: true,
            roomnum: "roomnum",
            onlineUsers: 1,
            state: false,
            time: 0,
          });
          resolve();
        });
      });
    });
  });

  describe("with two sockets", function () {
    /** @type {SocketClient} */
    let socket1;
    /** @type {SocketClient} */
    let socket2;

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
        new Promise((resolve) =>
          socket1.on("connect", function () {
            resolve();
          })
        ),
        new Promise((resolve) =>
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
        new Promise((resolve) => {
          socket1.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: true,
              roomnum: "roomnum",
              onlineUsers: 1,
              state: false,
              time: 0,
            });
            resolve();
          });
        }),
        new Promise((resolve) => {
          socket2.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              roomnum: "roomnum",
              onlineUsers: 2,
              state: false,
              time: 0,
            });
            resolve();
          });
        }),
      ]).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`).size).toBe(2);
      });
    });

    it("get online users", () => {
      return Promise.all([
        new Promise((resolve) =>
          socket1.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: true,
              roomnum: "roomnum",
              onlineUsers: 1,
              state: false,
              time: 0,
            });
            resolve();
          })
        ),

        new Promise((resolve) =>
          socket2.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              roomnum: "roomnum",
              onlineUsers: 2,
              state: false,
              time: 0,
            });
            resolve();
          })
        ),
        new Promise((resolve) => {
          socket1.on("getUsers", function (data) {
            expect(data.onlineUsers).toBe(2);
            resolve();
          });
        }),
      ]);
    });
  });
});
