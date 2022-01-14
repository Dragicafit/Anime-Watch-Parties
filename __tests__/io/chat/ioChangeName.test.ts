import { Server, Socket } from "socket.io";
import ioChangeName from "../../../src/server/io/chat/ioChangeName";
import { IoCallback, IoDebugSocket } from "../../../src/server/io/ioConst";
import { IoContext, SocketContext } from "../../../src/server/io/ioContext";
import { IoRoom } from "../../../src/server/io/ioRoom";

let io: Server;
let socket: Socket;
let changeName: (
  debugSocket: IoDebugSocket,
  name: string,
  callback: IoCallback
) => void;

let debugSocket: jest.Mock;
let name: string;
let callback: jest.Mock;

let emit: jest.Mock;

beforeEach((done) => {
  emit = jest.fn();

  debugSocket = jest.fn();
  name = "name";
  callback = jest.fn();

  io = new Server();
  IoRoom.ioContext = new IoContext(io, <any>null);
  socket = io.sockets._add(
    <any>{ conn: { protocol: 3, readyState: "open" }, id: "socket-1" },
    null,
    () => {
      let socketContext = new SocketContext(io, socket, <any>null);

      ioChangeName.start(socketContext, <any>null);
      changeName = (<any>socket).events.changeName;
      done();
    }
  );
});

it.each(["nam", "name_", Array(21).join("x")])("Valid", (name2) => {
  name = name2;
  changeName(debugSocket, name, callback);

  expect(callback).toHaveBeenNthCalledWith(1, null, {});

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(0);
  expect(callback).toHaveBeenCalledTimes(1);
});

it.each([
  null,
  undefined,
  Infinity,
  NaN,
  0,
  "",
  "na",
  [Array(32).join("x")],
  [true],
  () => {},
  function a() {},
])("With invalid name", (name2: any) => {
  name = name2;
  changeName(debugSocket, name, callback);

  expect(debugSocket).toHaveBeenNthCalledWith(1, "name is not a valid string");
  expect(callback).toHaveBeenNthCalledWith(1, "wrong input");

  expect(emit).toHaveBeenCalledTimes(0);
  expect(debugSocket).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
});
