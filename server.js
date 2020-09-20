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
  console.log(`Connected: ${connections} sockets connected`);

  socket.on("disconnect", () => {
    connections--;
    console.log(`${socket.id} disconnected: ${connections} sockets connected`);

    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return;
    if (socket.id === room.host) {
      room.host = undefined;
    }

    let session = socket.request.session;
    let username = session?.passport?.user?.display_name;
    if (username != null) {
      const index = room.users.indexOf(username);
      if (index > -1) {
        room.users.splice(index, 1);
        updateRoomUsers();
      }
    }
  });

  socket.on("joinRoom", (data, callback) => {
    console.log(`${socket.id} Join room`);
    if (data == null || typeof callback !== "function")
      return callback("wrong input");
    if (typeof data.roomnum !== "string" || !regexRoom.test(data.roomnum))
      return callback("wrong roomnum");
    console.log(`${socket.id} Join room ${data.roomnum}`);

    let session = socket.request.session;
    let username = session?.passport?.user?.display_name;
    if (username == null) return callback("not connected");

    let newRoomnum = data.roomnum.toLowerCase();
    if (socket.roomnum === newRoomnum) {
      return configure();
    }
    if (socket.roomnum != null) {
      let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
      if (room == null) {
        console.error("room null");
        return callback("error server");
      }
      socket.leave(`room-${socket.roomnum}`);
      const index = room.users.indexOf(username);
      if (index > -1) {
        room.users.splice(index, 1);
        updateRoomUsers(false);
      }
    }

    let init = io.sockets.adapter.rooms[`room-${newRoomnum}`] == null;
    socket.join(`room-${newRoomnum}`, (err) => {
      if (err) {
        console.error("join fail");
        return callback("error server");
      }
      configure(init);
    });

    function configure(init) {
      console.log(`${socket.id} connected to room-${newRoomnum}`);

      let room = io.sockets.adapter.rooms[`room-${newRoomnum}`];
      if (room == null) {
        console.error("room null");
        return callback("error server");
      }
      if (init) {
        room.currVideo = null;
        room.users = [username];
        room.hostName = "";
        room.state = false;
        room.currTime = 0;
        room.lastChange = performance.now();
      }
      if (username.toLowerCase() === newRoomnum) {
        console.log("I am the host");

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
      updateRoomUsers();

      callback(null, {
        roomnum: socket.roomnum,
        host: socket.id === room.host,
        username: username,
        hostName: room.hostName,
      });
    }
  });

  socket.on("changeStateServer", (data) => {
    console.log(`${socket.id} change state server`);
    if (data == null) return;
    if (typeof data.state !== "boolean") return;
    if (!Number.isFinite(data.time)) return;

    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return;
    if (socket.id !== room.host) return;

    console.log(
      `${socket.id} change state server room-${socket.roomnum} ${data.state} ${data.time}`
    );

    room.currTime = data.time;
    room.state = data.state;
    room.lastChange = performance.now();
    socket.broadcast.to(`room-${socket.roomnum}`).emit("changeStateClient", {
      time: room.currTime,
      state: room.state,
    });
  });

  socket.on("changeVideoServer", (data) => {
    console.log(`${socket.id} change video server`);
    if (data == null) return;
    if (!Number.isSafeInteger(data.videoId)) return;

    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return;
    if (socket.id !== room.host) return;

    console.log(
      `${socket.id} change video server room-${socket.roomnum} ${data.videoId}`
    );

    room.currVideo = data.videoId;
    socket.broadcast.to(`room-${socket.roomnum}`).emit("changeVideoClient", {
      videoId: room.currVideo,
    });
  });

  socket.on("syncClient", syncClient);

  function syncClient() {
    console.log(`${socket.id} sync client`);
    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return;

    console.log(`${socket.id} sync client room-${socket.roomnum}`);

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
      });
    }
  }

  function updateRoomUsers() {
    if (socket.roomnum == null) return;
    let room = io.sockets.adapter.rooms[`room-${socket.roomnum}`];
    if (room == null) return;

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
