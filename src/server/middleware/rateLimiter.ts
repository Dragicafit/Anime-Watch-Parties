import { Express } from "express";
import { BurstyRateLimiter, RateLimiterRedis } from "rate-limiter-flexible";
import { Server as IoServer } from "socket.io";
import { RedisClientType } from "../server";

export default {
  start: function (app: Express, io: IoServer, redisClient: RedisClientType) {
    redisClient.on("error", () => {});

    const rateLimiter = new BurstyRateLimiter(
      new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "limit",
        points: 50,
        duration: 1,
        inmemoryBlockOnConsumed: 100,
      }),
      new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "burst",
        points: 100,
        duration: 10,
        inmemoryBlockOnConsumed: 100,
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
