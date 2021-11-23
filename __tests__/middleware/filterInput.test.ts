import { Socket } from "socket.io";
import { IoCallback, supportedEvents } from "../../src/server/io/ioConst";
import filterInput from "../../src/server/middleware/filterInput";

const supportedEventsTest = {
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CHANGE_STATE_SERVER: "changeStateServer",
  CHANGE_VIDEO_SERVER: "changeVideoServer",
  SYNC_CLIENT: "syncClient",
  REPORT_BUG: "reportBug",
};

function emit([event, data, callback]: any[], next: any) {
  let socket: Socket = <Socket>{};
  socket.use = (
    fn: (event: any[], next: (err?: Error) => void) => void
  ): Socket => {
    fn([event, data, callback], next);
    return socket;
  };
  filterInput.start(socket);
}

function testSupportedEvents(
  executor: (
    supportedEvent: string,
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void
  ) => void
) {
  return Promise.all(
    Object.values(supportedEventsTest).map((supportedEvent) => {
      new Promise((resolve, reject) =>
        executor(supportedEvent, resolve, reject)
      );
    })
  );
}

describe("test argument middleware", function () {
  it("verify supported events", () => {
    expect(supportedEvents).toStrictEqual(supportedEventsTest);
    return Promise.resolve();
  });

  it("callbacks error with non existent event", () => {
    return new Promise<void>((resolve, reject) => {
      emit(
        ["nonExistent", null, <IoCallback>((err, data) => {
            expect(err).toBe("event is not valid");
            expect(data).toBeUndefined();
            resolve();
          })],
        () => reject()
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
