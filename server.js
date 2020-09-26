#!/usr/bin/env node
"use strict";

require("dotenv").config();
const fs = require("fs");

const app = require("express")();
const session = require("express-session");
const passport = require("passport");
const twitchStrategy = require("@d-fischer/passport-twitch").Strategy;
const handlebars = require("handlebars");
const server = require("https").createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);
const io = require("socket.io")(server, {
  perMessageDeflate: false,
});
const redisAdapter = require("socket.io-redis");
const performance = require("perf_hooks").performance;
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const rateLimiter = require("./middleware/rateLimiter");
const redisClient = redis.createClient();
const port = process.env.PORT || 4000;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

let connections = 0;
let regexRoom = /^\w{1,30}$/;
let regexVideoId = /^[\w\/-]{1,30}$/;
let regexSite = /^(wakanim|crunchyroll)$/;
let regexLocation = /^[a-zA-Z]{2}$/;

process.title = "AnimeWatchParties";

app.use(rateLimiter.express);
io.use(rateLimiter.socketIo);

io.adapter(redisAdapter());
var customsession = session({
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET,
  store: new RedisStore({ client: redisClient }),
  cookie: { secure: true, sameSite: "none" },
});
app.use(customsession);
io.use((socket, next) => {
  customsession(socket.request, socket.request.res || {}, next);
});

app.use(passport.initialize());
app.use(passport.session());
server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new twitchStrategy(
    {
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: CALLBACK_URL,
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

io.on("connection", (socket) => {
  connections++;
  function debug() {
    console.log(`${socket.id} connected:`, ...arguments);
  }
  debug(`${connections} sockets connected`);

  socket.on("disconnect", () => {
    connections--;
    function debug() {
      console.log(`${socket.id} disconnected:`, ...arguments);
    }
    debug(`${connections} sockets connected`);

    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return debug("room is null (error server)");
    if (socket.id === room.host) {
      room.host = undefined;
    }
    debug(`applied to room-${socket.roomnum}`);

    let session = socket.request.session;
    let username = session?.passport?.user?.display_name;
    if (username != null) {
      const index = room.users.indexOf(username);
      if (index > -1) {
        room.users.splice(index, 1);
        updateRoomUsers(debug);
      }
    }
  });

  socket.on("joinRoom", (data, callback) => {
    function debug() {
      console.log(`${socket.id} join room:`, ...arguments);
    }
    debug(data);
    if (data == null) return debug("data is null") || callback("wrong input");
    if (typeof callback !== "function")
      return debug("callback is not a function") || callback("wrong input");
    if (typeof data.roomnum !== "string" || !regexRoom.test(data.roomnum))
      return (
        debug("data.roomnum is not a valid string") || callback("wrong roomnum")
      );

    let session = socket.request.session;
    let username = session?.passport?.user?.display_name;
    if (username == null)
      return debug("socket is not connected") || callback("not connected");

    let newRoomnum = data.roomnum.toLowerCase();
    if (socket.roomnum === newRoomnum) {
      return configure();
    }
    if (socket.roomnum != null) {
      let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
      if (room == null) {
        return debug("room is null (error server)") || callback("error server");
      }
      socket.leave(`room-${socket.roomnum}`);
      const index = room.users.indexOf(username);
      if (index > -1) {
        room.users.splice(index, 1);
        updateRoomUsers(debug);
      }
    }

    let init = io.sockets.adapter.rooms[`room-${newRoomnum}`] == null;
    socket.join(`room-${newRoomnum}`, (err) => {
      if (err) {
        return (
          debug("join failed (error server): ", err) || callback("error server")
        );
      }
      configure(init);
    });

    function configure(init) {
      debug(`connected to room-${newRoomnum}`);

      let room = io.sockets.adapter.rooms[`room-${newRoomnum}`];
      if (room == null) {
        return debug("room is null (error server)") || callback("error server");
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
        debug("socket is host");

        if (room.host != null) socket.broadcast.to(room.host).emit("unSetHost");
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
      updateRoomUsers(debug);

      callback(null, {
        roomnum: socket.roomnum,
        host: socket.id === room.host,
        username: username,
        hostName: room.hostName,
      });
    }
  });

  socket.on("changeStateServer", (data) => {
    function debug() {
      console.log(`${socket.id} change state server:`, ...arguments);
    }
    debug(data);
    if (data == null) return debug("data is null");
    if (typeof data.state !== "boolean")
      return debug("data.state is not boolean");
    if (!Number.isFinite(data.time)) return debug("data.time is not int");

    if (socket.roomnum == null) return debug("socket is not connected to room");
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return debug("room is null (error server)");
    if (socket.id !== room.host) return debug("socket is not host");
    debug(`applied to room-${socket.roomnum}`);

    room.currTime = data.time;
    room.state = data.state;
    room.lastChange = performance.now();
    socket.broadcast.to(`room-${socket.roomnum}`).emit("changeStateClient", {
      time: room.currTime,
      state: room.state,
    });
  });

  socket.on("changeVideoServer", (data) => {
    function debug() {
      console.log(`${socket.id} change video server:`, ...arguments);
    }
    debug(data);
    if (data == null) return debug("data is null");
    if (typeof data.videoId !== "string" || !regexVideoId.test(data.videoId))
      return debug("data.videoId is not a valid string");
    if (typeof data.site !== "string" || !regexSite.test(data.site))
      return debug("data.site is not a valid string");
    if (typeof data.location !== "string" || !regexLocation.test(data.location))
      return debug("data.location is not a valid string");

    if (socket.roomnum == null) return debug("socket is not connected to room");
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return debug("room is null (error server)");
    if (socket.id !== room.host) return debug("socket is not host");
    debug(`applied to room-${socket.roomnum}`);

    room.currVideo = data.videoId;
    room.site = data.site;
    room.location = data.location;
    socket.broadcast.to(`room-${socket.roomnum}`).emit("changeVideoClient", {
      videoId: room.currVideo,
      site: room.site,
      location: room.location,
    });
  });

  socket.on("syncClient", syncClient);

  function syncClient() {
    function debug() {
      console.log(`${socket.id} sync client:`, ...arguments);
    }
    debug();
    if (socket.roomnum == null) return debug("socket is not connected to room");
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return debug("room is null (error server)");
    debug(`applied to room-${socket.roomnum}`);

    if (
      room.currTime != null &&
      room.state != null &&
      room.lastChange != null
    ) {
      console.log(`${socket.id} change state client`);
      let currTime = room.currTime;
      if (room.state) currTime += (performance.now() - room.lastChange) / 1000;
      socket.emit("changeStateClient", {
        time: currTime,
        state: room.state,
      });
    }
    if (room.currVideo != null) {
      console.log(`${socket.id} change video client`);
      socket.emit("changeVideoClient", {
        videoId: room.currVideo,
        site: room.site,
        location: room.location,
      });
    }
  }

  function updateRoomUsers(debug) {
    if (socket.roomnum == null) return debug("socket is not connected to room");
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return debug("room is null (error server)");
    debug(`applied to room-${socket.roomnum}`);

    io.sockets.to(`room-${socket.roomnum}`).emit("getUsers", {
      onlineUsers: room.users.length,
    });
  }
});

app.get(
  "/auth/twitch",
  passport.authenticate("twitch", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

var template = handlebars.compile(`
<html><head><title>Twitch Auth Sample</title><script>window.close()</script></head>
<table>
    <tr><th>Access Token</th><td>{{accessToken}}</td></tr>
    <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>
    <tr><th>Display Name</th><td>{{display_name}}</td></tr>
    <tr><th>Id</th><td>{{id}}</td></tr>
</table></html>`);

app.get("/", function (req, res) {
  let session = req.session;
  let user = session?.passport?.user;
  if (user) {
    res.send(template(user));
  } else {
    res.send(
      '<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>'
    );
  }
});
