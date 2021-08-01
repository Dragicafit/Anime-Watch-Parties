import "dotenv/config";
import fs from "fs";
import express from "express";
import debugModule from "debug";
import https from "https";
import { createAdapter } from "socket.io-redis";
import { RedisClient } from "redis";
import rateLimiter from "./middleware/rateLimiter";
import passport from "./middleware/passport";
import ioServerSetup from "./ioServerSetup";
import httpServerSetup from "./httpServerSetup";

const app = express();
const debug = debugModule("serverAWP");
const server = https.createServer(
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
    origin: process.env
      .EXTENSION_IDS!.split(",")
      .map((extensionId) => extensionId.trim()),
    credentials: true,
  },
});
const redisClient = new RedisClient({});

rateLimiter.start(app, io, redisClient);
passport.start(app, io, redisClient);
ioServerSetup.start(io);
httpServerSetup.start(app);

const port = process.env.PORT || 4000;

const debugMain = debug.extend("main");

process.title = "AnimeWatchParties";

const pubClient = redisClient;
const subClient = pubClient.duplicate();
io.adapter(createAdapter({ pubClient, subClient }));

server.listen(port, () => {
  debugMain(`Server listening at port ${port}`);
});
