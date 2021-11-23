import { Server, Socket } from "socket.io";
import ioReportBug from "../../src/server/io/ioReportBug";
import { IoContext, SocketContext } from "../../src/server/io/ioContext";
import { IoRoom } from "../../src/server/io/ioRoom";
import { IoUtils } from "../../src/server/io/ioUtils";
import { Performance } from "perf_hooks";
import { IoCallback, IoDebugSocket } from "../../src/server/io/ioConst";

let io: Server;
let socket: Socket;
let ioUtils: IoUtils;
let reportBug: (
  debugSocket: IoDebugSocket,
  logs: string[],
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let logs: string[];
let callback: jest.Mock;

let emit: jest.Mock;
let performance: Performance;

beforeEach((done) => {
  emit = jest.fn();
  performance = <any>{ now: jest.fn(() => 5) };

  debugSocket = jest.fn();
  logs = ["logs"];
  callback = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(<Server>io, <Performance>performance);
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      socket.to = <any>((roomKey: string) => {
        return { emit: emit };
      });

      let socketContext = new SocketContext(io, socket, performance);
      ioUtils = new IoUtils(socketContext);

      ioReportBug.start(socketContext, ioUtils);
      reportBug = (<any>socket).events.reportBug;
      done();
    }
  );
});

it.each([[[]], [["log1", "log2"]]])("Valid", (logs2) => {
  logs = logs2;
  reportBug(debugSocket, logs, callback);

  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);
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
])("With invalid state", (logs2: any) => {
  logs = logs2;
  reportBug(debugSocket, logs, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(
    1,
    "logs is not an array of strings"
  );
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(performance.now).toHaveBeenCalledTimes(0);
});
