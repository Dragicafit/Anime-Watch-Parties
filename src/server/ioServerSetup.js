const debug = require("debug")("ioServerAWP");
const performance = require("perf_hooks").performance;

const debugConnection = debug.extend("connection");
const debugDisconnect = debug.extend("disconnect");
const debugJoinRoom = debug.extend("joinRoom");
const debugChangeStateServer = debug.extend("changeStateServer");
const debugChangeVideoServer = debug.extend("changeVideoServer");
const debugSyncClient = debug.extend("syncClient");

let regexRoom = /^\w{1,30}$/;
let regexVideoId = /^[\w\/-]{1,300}$/;
let regexSite = /^(wakanim|crunchyroll)$/;
let regexLocation = /^[a-zA-Z]{2}$/;

module.exports = {
  start: function (io) {
    let connections = 0;

    io.on("connection", (socket) => {
      connections++;
      function debugConnection2() {
        debugConnection(`${socket.id}:`, ...arguments);
      }
      debugConnection2(`${connections} sockets connected`);

      socket.on("disconnect", () => {
        connections--;
        function debugDisconnect2() {
          debugDisconnect(`${socket.id}:`, ...arguments);
        }
        debugDisconnect2(`${connections} sockets connected`);

        if (socket.roomnum == null) return;
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null) return debugDisconnect2("room is null (empty room)");
        if (socket.id === room.host) {
          room.host = undefined;
        }
        debugDisconnect2(`applied to room-${socket.roomnum}`);

        let socketSession = socket.request.session;
        let username = socketSession?.passport?.user?.display_name;
        if (username != null) {
          const index = room.users.indexOf(username);
          if (index > -1) {
            room.users.splice(index, 1);
            updateRoomUsers(debugDisconnect2);
          }
        }
      });

      socket.on("joinRoom", (data, callback) => {
        function debugJoinRoom2() {
          debugJoinRoom(`${socket.id}:`, ...arguments);
        }
        debugJoinRoom2(data);
        if (typeof callback !== "function") {
          debugJoinRoom2("callback is not a function");
          return;
        }
        if (data == null) {
          debugJoinRoom2("data is null");
          return callback("wrong input");
        }
        if (typeof data.roomnum !== "string" || !regexRoom.test(data.roomnum)) {
          debugJoinRoom2("data.roomnum is not a valid string");
          return callback("wrong roomnum");
        }

        let socketSession = socket.request.session;
        let username = socketSession?.passport?.user?.display_name;
        if (username == null) {
          debugJoinRoom2("socket is not connected");
          return callback("not connected");
        }

        let init = false;
        let newRoomnum = data.roomnum.toLowerCase();
        if (socket.roomnum === newRoomnum) {
          return configure();
        }
        if (socket.roomnum != null) {
          let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
          if (room == null) {
            debugJoinRoom2("room is null (error server)");
            return callback("error server");
          }
          socket.leave(`room-${socket.roomnum}`);
          const index = room.users.indexOf(username);
          if (index > -1) {
            room.users.splice(index, 1);
            updateRoomUsers(debugJoinRoom2);
          }
        }

        init = io.sockets.adapter.rooms.get(`room-${newRoomnum}`) == null;
        socket.join(`room-${newRoomnum}`);
        configure();

        function configure() {
          debugJoinRoom2(`connected to room-${newRoomnum}`);

          let room = io.sockets.adapter.rooms.get(`room-${newRoomnum}`);
          if (room == null) {
            debugJoinRoom2("room is null (error server)");
            return callback("error server");
          }
          if (init) {
            room.currVideo = null;
            room.site = null;
            room.location = null;
            room.users = [username];
            room.hostName = "";
            room.state = false;
            room.currTime = 0;
            room.lastChange = performance.now();
          }
          if (username.toLowerCase() === newRoomnum) {
            debugJoinRoom2("socket is host");

            if (room.host != null)
              socket.broadcast.to(room.host).emit("unSetHost");
            room.host = socket.id;
            room.hostName = username;

            io.sockets.to(`room-${newRoomnum}`).emit("changeHostLabel", {
              username: room.hostName,
            });
          }
          if (!init) {
            if (!room.users.includes(username)) room.users.push(username);
            setTimeout(() => {
              syncClient();
            }, 1000);
          }
          socket.roomnum = newRoomnum;
          updateRoomUsers(debugJoinRoom2);

          callback(null, {
            roomnum: socket.roomnum,
            host: socket.id === room.host,
            username: username,
            hostName: room.hostName,
          });
        }
      });

      socket.on("changeStateServer", (data) => {
        function debugChangeStateServer2() {
          debugChangeStateServer(`${socket.id}:`, ...arguments);
        }
        debugChangeStateServer2(data);
        if (data == null) return debugChangeStateServer2("data is null");
        if (typeof data.state !== "boolean")
          return debugChangeStateServer2("data.state is not boolean");
        if (!Number.isFinite(data.time))
          return debugChangeStateServer2("data.time is not int");

        if (socket.roomnum == null)
          return debugChangeStateServer2("socket is not connected to room");
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null)
          return debugChangeStateServer2("room is null (error server)");
        if (socket.id !== room.host)
          return debugChangeStateServer2("socket is not host");
        debugChangeStateServer2(`applied to room-${socket.roomnum}`);

        room.currTime = data.time;
        room.state = data.state;
        room.lastChange = performance.now();
        socket.broadcast
          .to(`room-${socket.roomnum}`)
          .emit("changeStateClient", {
            time: room.currTime,
            state: room.state,
          });
      });

      socket.on("changeVideoServer", (data) => {
        function debugChangeVideoServer2() {
          debugChangeVideoServer(`${socket.id}:`, ...arguments);
        }
        debugChangeVideoServer2(data);
        if (data == null) return debugChangeVideoServer2("data is null");
        if (
          typeof data.videoId !== "string" ||
          !regexVideoId.test(data.videoId)
        )
          return debugChangeVideoServer2("data.videoId is not a valid string");
        if (typeof data.site !== "string" || !regexSite.test(data.site))
          return debugChangeVideoServer2("data.site is not a valid string");
        if (
          typeof data.location !== "string" ||
          !regexLocation.test(data.location)
        )
          return debugChangeVideoServer2("data.location is not a valid string");

        if (socket.roomnum == null)
          return debugChangeVideoServer2("socket is not connected to room");
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null)
          return debugChangeVideoServer2("room is null (error server)");
        if (socket.id !== room.host)
          return debugChangeVideoServer2("socket is not host");
        debugChangeVideoServer2(`applied to room-${socket.roomnum}`);

        room.currVideo = data.videoId;
        room.site = data.site;
        room.location = data.location;
        socket.broadcast
          .to(`room-${socket.roomnum}`)
          .emit("changeVideoClient", {
            videoId: room.currVideo,
            site: room.site,
            location: room.location,
          });
      });

      socket.on("syncClient", syncClient);

      function syncClient() {
        function debugSyncClient2() {
          debugSyncClient(`${socket.id}:`, ...arguments);
        }
        debugSyncClient2();
        if (socket.roomnum == null)
          return debugSyncClient2("socket is not connected to room");
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null)
          return debugSyncClient2("room is null (error server)");
        debugSyncClient2(`applied to room-${socket.roomnum}`);

        if (
          room.currTime != null &&
          room.state != null &&
          room.lastChange != null
        ) {
          debugSyncClient2("change state client");
          let currTime = room.currTime;
          if (room.state)
            currTime += (performance.now() - room.lastChange) / 1000;
          socket.emit("changeStateClient", {
            time: currTime,
            state: room.state,
          });
        }
        if (room.currVideo != null) {
          debugSyncClient2("change video client");
          socket.emit("changeVideoClient", {
            videoId: room.currVideo,
            site: room.site,
            location: room.location,
          });
        }
      }

      function updateRoomUsers(debugUpdateRoomUsers2) {
        if (socket.roomnum == null)
          return debugUpdateRoomUsers2("socket is not connected to room");
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null)
          return debugUpdateRoomUsers2("room is null (empty room)");
        debugUpdateRoomUsers2(`applied to room-${socket.roomnum}`);

        io.sockets.to(`room-${socket.roomnum}`).emit("getUsers", {
          onlineUsers: room.users.length,
        });
      }
    });
  },
  close: function (io) {
    return new Promise((resolve) => io.close(resolve));
  },
};
