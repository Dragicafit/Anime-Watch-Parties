#!/usr/bin/env node
"use strict";

require("dotenv").config();
const fs = require("fs");

const {
  serverIo,
  serverServer,
  serverRedisClient,
} = require("../src/server/server");

const io = require("socket.io-client");
const port = process.env.PORT || 4000;

describe("test arguments", function () {
  var socket;

  beforeEach((done) => {
    serverRedisClient.flushall(() => {
      socket = io.connect(`https://localhost:${port}`, {
        ca: fs.readFileSync("cert.pem"),
        reconnectionDelay: 0,
        forceNew: true,
      });
      socket.on("connect", function () {
        done();
      });
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

  describe("emit disconnect", () => {
    it("throw an error", (done) => {
      expect(() => socket.emit("disconnect")).toThrow(
        new Error('"disconnect" is a reserved event name')
      );

      done();
    });
  });

  describe("emit joinRoom", () => {
    it("ignores call without arguments", (done) => {
      socket.emit("joinRoom");

      done();
    });

    it("ignores call without callback", (done) => {
      socket.emit("joinRoom", { roomnum: "roomnum" });

      done();
    });

    it("callback error without data", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", null, (err, data) => {
        expect(err).toBe("wrong input");
        expect(data).toBeUndefined();
        done();
      });
    });

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
        expect(err).toBe("wrong roomnum");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("callback error with roomnum empty", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "" }, (err, data) => {
        expect(err).toBe("wrong roomnum");
        expect(data).toBeUndefined();
        done();
      });
    });

    it("callback error with roomnum not a word", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: "-" }, (err, data) => {
        expect(err).toBe("wrong roomnum");
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
          expect(err).toBe("wrong roomnum");
          expect(data).toBeUndefined();
          done();
        }
      );
    });

    it("callback error with roomnum not a string", (done) => {
      expect.assertions(2);
      socket.emit("joinRoom", { roomnum: 26 }, (err, data) => {
        expect(err).toBe("wrong roomnum");
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

afterAll(() => {
  return Promise.all([
    new Promise((res, rej) => serverIo.sockets.adapter.pubClient.quit(res)),
    new Promise((res, rej) => serverIo.sockets.adapter.subClient.quit(res)),
    new Promise((res, rej) => serverServer.close(res)),
    new Promise((res, rej) => serverRedisClient.quit(res)),
  ]);
});
