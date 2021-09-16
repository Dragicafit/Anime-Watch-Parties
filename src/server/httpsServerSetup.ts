import debugModule from "debug";
import express, { Express } from "express";
import exphbs from "express-handlebars";
import path from "path";

const debug = debugModule("httpsServerAWP");

export default {
  start: function (app: Express) {
    app.engine("handlebars", exphbs());

    app.set("view engine", "handlebars");

    app.use(
      "/favicon.ico",
      express.static(path.join(__dirname, "../icons/activate.svg"))
    );

    app.get("/*", function (req, res) {
      res.render("home");
    });
  },
};
