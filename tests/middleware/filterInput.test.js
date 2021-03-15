#!/usr/bin/env node
"use strict";

require("dotenv").config();

const filterInput = require("../../src/server/middleware/filterInput");

const supportedEvents = {
  JOIN_ROOM: "joinRoom",
  CHANGE_STATE_SERVER: "changeStateServer",
  CHANGE_VIDEO_SERVER: "changeVideoServer",
  SYNC_CLIENT: "syncClient",
};

function emit([event, data, callback], next) {
  let socket = {};
  socket.use = (fn) => {
    fn([event, data, callback], next);
  };
  filterInput.start(socket);
}

function testSupportedEvents(executor) {
  return Promise.all(
    Object.values(supportedEvents).map((supportedEvent) => {
      new Promise((resolve, reject) =>
        executor(supportedEvent, resolve, reject)
      );
    })
  );
}

describe("test argument middleware", function () {
  it("verify supported events", () => {
    expect(filterInput.supportedEvents).toStrictEqual(supportedEvents);
    return Promise.resolve();
  });

  it("callbacks error with non existent event", () => {
    return new Promise((resolve, reject) => {
      emit(
        [
          "nonExistent",
          null,
          (err, data) => {
            expect(err).toBe("event is not valid");
            expect(data).toBeUndefined();
            resolve();
          },
        ],
        reject
      );
    });
  });

  it("accepts without data and callback", () => {
    return testSupportedEvents((supportedEvent, resolve) =>
      emit([supportedEvent], resolve)
    );
  });

  it("accepts without callback", () => {
    return testSupportedEvents((supportedEvent, resolve) =>
      emit([supportedEvent, {}], resolve)
    );
  });

  it("accepts without data", () => {
    return testSupportedEvents((supportedEvent, resolve, reject) =>
      emit([supportedEvent, reject], resolve)
    );
  });

  it("accepts with undefined data", () => {
    return testSupportedEvents((supportedEvent, resolve, reject) =>
      emit([supportedEvent, undefined, reject], resolve)
    );
  });

  it("accepts with null data", () => {
    return testSupportedEvents((supportedEvent, resolve, reject) =>
      emit([supportedEvent, null, reject], resolve)
    );
  });

  it("callback error with invalid data", () => {
    return testSupportedEvents((supportedEvent, resolve, reject) =>
      emit([supportedEvent, 0, resolve], reject)
    );
  });
});
