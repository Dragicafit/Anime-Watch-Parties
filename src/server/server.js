#!/usr/bin/env node
"use strict";

require("dotenv").config();
const fs = require("fs");

const app = require("express")();
const debug = require("debug")("serverAWP");
const server = require("https").createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);
const { Server: IoServer } = require("socket.io");
const io = new IoServer(server, {
  perMessageDeflate: false,
  cors: {
    origin: process.env.EXTENSION_IDS.split(",").map((extensionId) =>
      extensionId.trim()
    ),
    credentials: true,
  },
});
const redisAdapter = require("socket.io-redis");
const redisClient = require("redis").createClient();
const rateLimiter = require("./middleware/rateLimiter");
const passport = require("./middleware/passport");
const ioServerSetup = require("./ioServerSetup");
const httpServerSetup = require("./httpServerSetup");

rateLimiter.start(app, io, redisClient);
passport.start(app, io, redisClient);
ioServerSetup.start(io);
httpServerSetup.start(app);

const port = process.env.PORT || 4000;

const debugMain = debug.extend("main");

process.title = "AnimeWatchParties";

io.adapter(redisAdapter());

server.listen(port, () => {
  debugMain(`Server listening at port ${port}`);
});
