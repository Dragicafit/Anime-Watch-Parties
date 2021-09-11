import debugModule from "debug";
import "dotenv/config";
import express from "express";
import fs from "fs";
import https from "https";
import { RedisClient } from "redis";
import { createAdapter } from "socket.io-redis";
import ioServerSetup from "./ioServerSetup";
import rateLimiter from "./middleware/rateLimiter";

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
ioServerSetup.start(io);

const port = process.env.PORT || 4000;

const debugMain = debug.extend("main");

process.title = "AnimeWatchParties";

const pubClient = redisClient;
const subClient = pubClient.duplicate();
io.adapter(createAdapter({ pubClient, subClient }));

server.listen(port, () => {
  debugMain(`Server listening at port ${port}`);
});
