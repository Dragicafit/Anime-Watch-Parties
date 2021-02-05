require("dotenv").config();

const debug = require("debug")("passportServerAWP");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const twitchStrategy = require("passport-twitch-new").Strategy;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

module.exports = {
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
    io.use((socket, next) => {
      customsession(socket.request, socket.request.res || {}, next);
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

    app.get(
      "/auth/twitch",
      passport.authenticate("twitch", {
        successRedirect: "/",
        failureRedirect: "/",
      })
    );
  },
};
