import "dotenv/config";

import debugModule from "debug";
import { Express, RequestHandler } from "express";
import { Server as IoServer, Socket } from "socket.io";
import { RedisClient } from "redis";
import session from "express-session";
import RedisStore from "connect-redis";
import { Strategy as twitchStrategy } from "passport-twitch-strategy";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import passport from "passport";

const debug = debugModule("passportServerAWP");
const RedisStoreSession = RedisStore(session);

const wrap =
  (middleware: RequestHandler) =>
  (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    next: (err?: ExtendedError) => void
  ) =>
    middleware(<any>socket.request, <any>{}, <any>next);

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_SECRET = process.env.TWITCH_SECRET!;
const SESSION_SECRET = process.env.SESSION_SECRET!;
const CALLBACK_URL = process.env.CALLBACK_URL!;

export default {
  start: function (app: Express, io: IoServer, redisClient: RedisClient) {
    app.use(passport.initialize());
    app.use(passport.session());
    var customsession = session({
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
      store: new RedisStoreSession({ client: redisClient }),
      cookie: { secure: true, sameSite: "none" },
    });
    app.use(customsession);
    io.use(wrap(customsession));

    io.use((socket, next) => {
      (<any>socket).auths = (<any>socket.request).session?.passport?.user;
      next();
    });

    passport.serializeUser((user, done) => {
      done(null, user);
    });
    passport.deserializeUser((user, done) => {
      done(null, <any>user);
    });
    passport.use(
      "twitch",
      new twitchStrategy(
        {
          clientID: TWITCH_CLIENT_ID,
          clientSecret: TWITCH_SECRET,
          callbackURL: CALLBACK_URL,
          scope: "user_read",
        },
        (accessToken: any, refreshToken: any, profile: any, done: any) => {
          done(null, profile);
        }
      )
    );

    app.get("/auth/twitch", (req, res, next) => {
      passport.authenticate("twitch", (err, user) => {
        if (err || user === false) return res.redirect("/");

        let userNew = (<any>req.session).passport?.user || {};
        userNew[user.provider] = {
          display_name: user.display_name,
          id: user.id,
        };

        (<any>req).logIn(userNew, () => {
          res.redirect("/");
        });
      })(req, res, next);
    });
  },
};
