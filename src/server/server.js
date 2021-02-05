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
const io = require("socket.io")(server, {
  perMessageDeflate: false,
  cors: {
    origin: `moz-extension://${process.env.EXTENSION_ID}`,
    credentials: true,
  },
});
const redisAdapter = require("socket.io-redis");
const redisClient = require("redis").createClient();

require("./middleware/rateLimiter").start(app, io, redisClient);
require("./middleware/passport").start(app, io, redisClient);
require("./ioServerSetup").start(io);
require("./httpServerSetup").start(app);

const port = process.env.PORT || 4000;

const debugMain = debug.extend("main");

process.title = "AnimeWatchParties";

io.adapter(redisAdapter());

server.listen(port, () => {
  debugMain(`Server listening at port ${port}`);
});
