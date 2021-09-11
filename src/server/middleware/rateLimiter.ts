import debugModule from "debug";
import { Express } from "express";
import { BurstyRateLimiter, RateLimiterRedis } from "rate-limiter-flexible";
import { RedisClient } from "redis";
import { Server as IoServer } from "socket.io";

const debug = debugModule("rateLimiterServerAWP");

export default {
  start: function (app: Express, io: IoServer, redisClient: RedisClient) {
    const rateLimiter = new BurstyRateLimiter(
      new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "limit",
        points: 5,
        duration: 1,
        inmemoryBlockOnConsumed: 10,
      }),
      new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "burst",
        points: 10,
        duration: 10,
        inmemoryBlockOnConsumed: 10,
      })
    );

    app.use((req, res, next) => {
      rateLimiter
        .consume(req.ip)
        .then(() => {
          next();
        })
        .catch(() => {
          res.status(429).send("Too Many Requests");
        });
    });
    io.use((socket, next) => {
      rateLimiter
        .consume(socket.handshake.address)
        .then(() => {
          next();
        })
        .catch(() => next(new Error("Too Many Requests")));

      socket.use(([event, data, callback], next2) => {
        rateLimiter
          .consume(socket.handshake.address)
          .then(() => {
            next2();
          })
          .catch(() => {
            if (typeof data === "function") {
              callback = data;
            }
            if (typeof callback === "function") {
              callback();
            }
          });
      });
    });
  },
};
