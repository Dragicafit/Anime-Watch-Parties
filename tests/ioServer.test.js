#!/usr/bin/env node
"use strict";

require("dotenv").config();

const ioClient = require("socket.io-client");
const ioServerSetup = require("../src/server/ioServerSetup");
const { Server: ioServer } = require("socket.io");

const portTest = process.env.PORT_TEST || 4001;
const port = process.env.PORT != portTest ? portTest : portTest + 1;

/** @type {ioServer} */
let io;

beforeEach(() => {
  io = new ioServer(port);
  ioServerSetup.start(io);
  return Promise.resolve();
});

afterEach(() => {
  return ioServerSetup.close(io);
});

describe("test argument middleware", function () {
  /** @type {ioClient.Socket} */
  let socket;

  beforeEach((done) => {
    socket = ioClient.io(`http://localhost:${port}`, {
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

  it("throw an error", () => {
    return new Promise((resolve) => {
      expect(() => socket.emit("disconnect")).toThrow(
        new Error('"disconnect" is a reserved event name')
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
    ioServerSetup.supportedEvents.map((supportedEvent) =>
      socket.emit(supportedEvent)
    );
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("accepts without callback", () => {
    ioServerSetup.supportedEvents.map((supportedEvent) =>
      socket.emit(supportedEvent, {})
    );
    return new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("accepts without data", () => {
    return Promise.all(
      ioServerSetup.supportedEvents.map((supportedEvent) => {
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
      ioServerSetup.supportedEvents.map((supportedEvent) => {
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
      ioServerSetup.supportedEvents.map((supportedEvent) => {
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
      ioServerSetup.supportedEvents.map((supportedEvent) => {
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
  /** @type {ioClient.Socket} */
  let socket;

  beforeEach((done) => {
    socket = ioClient.io(`http://localhost:${port}`, {
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
    it("callback error without connection", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
        expect(err).toBe("not connected");
        expect(data).toBeUndefined();
        done();
      });
    });

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
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "_" }, (err, data) => {
        expect(err).toBe("not connected");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("reaches connection with 30 char", (done) => {
      expect.assertions(2);
      socket.emit(
        "joinRoom",
        { roomnum: "abcabcabcabcabcabcabcabcabcabc" },
        (err, data) => {
          expect(err).toBe("not connected");
          expect(data).toBeUndefined();
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
      socket.emit("changeStateServer");

      done();
    });

    it("state is null", (done) => {
      socket.emit("changeStateServer", { state: null, time: 20 });

      done();
    });

    it("time is null", (done) => {
      socket.emit("changeStateServer", { state: true, time: null });

      done();
    });

    it("time is null", (done) => {
      socket.emit("changeStateServer", {
        state: true,
        time: 2000000000000000000000000000000000000000000000000,
      });

      done();
    });

    it("time is null", (done) => {
      socket.emit("changeStateServer", { state: true, time: 20 });

      done();
    });
  });

  describe("emit changeVideoServer", () => {
    it("emit changeVideoServer", (done) => {
      socket.emit("changeVideoServer", {
        videoId: "videoId",
        site: "wakanim",
        location: "fr",
      });

      done();
    });

    it("emit changeVideoServer", (done) => {
      socket.emit("changeVideoServer", {
        videoId: "videoId",
        site: "wakanim",
        location: "fr",
      });

      done();
    });

    it("emit changeVideoServer", (done) => {
      socket.emit("changeVideoServer", {
        videoId: "videoId",
        site: "wakanim",
        location: "fr",
      });

      done();
    });

    it("emit changeVideoServer", (done) => {
      socket.emit("changeVideoServer", {
        videoId: "videoId",
        site: "wakanim",
        location: "fr",
      });

      done();
    });
  });

  describe("emit syncClient", () => {
    it("emit syncClient", (done) => {
      socket.emit("syncClient");

      done();
    });
  });
});

describe("test connection", function () {
  beforeEach(() => {
    io.use((socket, next) => {
      socket.username = socket.handshake.query.username;
      next();
    });
    return Promise.resolve();
  });

  describe("with one socket", function () {
    /** @type {ioClient.Socket} */
    let socket;

    beforeEach(() => {
      socket = ioClient.io(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        query: {
          username: "socket",
        },
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
            host: false,
            hostName: "",
            roomnum: "roomnum",
            username: "socket",
          });
          resolve();
        })
      ).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`).size).toBe(1);
      });
    });

    it("get online users", () => {
      socket.emit("joinRoom", { roomnum: "roomnum" });
      return new Promise((resolve) => {
        socket.on("getUsers", function (data) {
          expect(data.onlineUsers).toBe(1);
          resolve();
        });
      });
    });
  });

  describe("with two sockets", function () {
    /** @type {ioClient.Socket} */
    let socket1;
    /** @type {ioClient.Socket} */
    let socket2;

    beforeEach(() => {
      socket1 = ioClient.io(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        query: {
          username: "socket1",
        },
      });
      socket2 = ioClient.io(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        query: {
          username: "socket2",
        },
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
        new Promise((resolve) =>
          socket1.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              hostName: "",
              roomnum: "roomnum",
              username: "socket1",
            });
            resolve();
          })
        ),
        new Promise((resolve) =>
          socket2.emit("joinRoom", { roomnum: "roomnum" }, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual({
              host: false,
              hostName: "",
              roomnum: "roomnum",
              username: "socket2",
            });
            resolve();
          })
        ),
      ]).then(() => {
        expect(io.sockets.adapter.rooms.get(`room-roomnum`)).toBeDefined();
        expect(io.sockets.adapter.rooms.get(`room-roomnum`).size).toBe(2);
      });
    });

    it("get online users", () => {
      socket1.emit("joinRoom", { roomnum: "roomnum" });
      socket2.emit("joinRoom", { roomnum: "roomnum" });
      return Promise.all([
        new Promise((resolve) => {
          socket1.on("getUsers", function (data) {
            expect(data.onlineUsers).toBe(1);
            resolve();
          });
        }),
        new Promise((resolve) => {
          socket2.on("getUsers", function (data) {
            expect(data.onlineUsers).toBe(2);
            resolve();
          });
        }),
      ]);
    });
  });
});