const {
  RateLimiterRedis,
  BurstyRateLimiter,
} = require("rate-limiter-flexible");

module.exports = {
  start: function (app, io, redisClient) {
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
        .catch(() => {});

      socket.use((packet, next) => {
        rateLimiter
          .consume(socket.handshake.address)
          .then(() => {
            next();
          })
          .catch(() => {
            if (typeof packet[2] === "function") return packet[2]();
          });
      });
    });
  },
};
