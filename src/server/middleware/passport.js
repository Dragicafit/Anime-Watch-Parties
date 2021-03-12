"use strict";

require("dotenv").config();

const debug = require("debug")("passportServerAWP");
const { Express } = require("express");
const { Server: ioServer } = require("socket.io");
const { RedisClient } = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const twitchStrategy = require("passport-twitch-new").Strategy;
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

module.exports = {
  /** @param {Express} app @param {ioServer} io @param {RedisClient} redisClient */
  start: function (app, io, redisClient) {
    const passport = require("passport");

    app.use(passport.initialize());
    app.use(passport.session());
    var customsession = session({
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
      store: new RedisStore({ client: redisClient }),
      cookie: { secure: true, sameSite: "none" },
    });
    app.use(customsession);
    io.use(wrap(customsession));

    io.use((socket, next) => {
      socket.auths = socket.request.session?.passport?.user;
      next();
    });

    passport.serializeUser((user, done) => {
      done(null, user);
    });
    passport.deserializeUser((user, done) => {
      done(null, user);
    });
    passport.use(
      "twitch",
      new twitchStrategy(
        {
          clientID: TWITCH_CLIENT_ID,
          clientSecret: TWITCH_SECRET,
          callbackURL: CALLBACK_URL,
          state: true,
        },
        (accessToken, refreshToken, profile, done) => {
          done(null, profile);
        }
      )
    );

    app.get("/auth/twitch", (req, res, next) => {
      passport.authenticate("twitch", (err, user) => {
        if (err || user === false) return res.redirect("/");

        let userNew = req.session.passport?.user || {};
        userNew[user.provider] = {
          display_name: user.display_name,
          id: user.id,
        };

        req.logIn(userNew, () => {
          res.redirect("/");
        });
      })(req, res, next);
    });
  },
};
