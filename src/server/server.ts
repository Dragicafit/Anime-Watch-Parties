import debugModule from "debug";
import "dotenv/config";
import express from "express";
import fs from "fs";
import https from "https";
import { RedisClient } from "redis";
import { Server as IoServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import httpsServerSetup from "./httpsServerSetup";
import ioServerSetup from "./ioServerSetup";
import rateLimiter from "./middleware/rateLimiter";

process.title = "AnimeWatchParties";

const debug = debugModule("serverAWP");

const debugMain = debug.extend("main");

const port = process.env.PORT || 4000;
const extensionIds = process.env
  .EXTENSION_IDS!.split(",")
  .map((extensionId) => extensionId.trim());

const app = express();
const pubClient = new RedisClient({});
const subClient = pubClient.duplicate();
const httpsServer = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);
const io = new IoServer(httpsServer, {
  cors: { origin: "*", credentials: true },
  allowRequest: (req, callback) => {
    const isOriginValid =
      req.headers.origin == null ||
      extensionIds.some(
        (extensionId) => req.headers.origin!.match(extensionId) != null
      );
    callback(null, isOriginValid);
  },
  adapter: createAdapter(pubClient, subClient),
});

rateLimiter.start(app, io, pubClient);
ioServerSetup.start(io);
httpsServerSetup.start(app);

httpsServer.listen(port, () => {
  debugMain(`Server listening at port ${port}`);
});
