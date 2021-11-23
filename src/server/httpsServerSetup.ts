import express, { Express } from "express";
import exphbs from "express-handlebars";
import path from "path";

export default {
  start: function (app: Express) {
    app.engine("handlebars", exphbs());

    app.set("view engine", "handlebars");

    app.use(
      "/favicon.ico",
      express.static(path.join(__dirname, "../icons/activate.svg"))
    );

    app.use(
      "/logo.svg",
      express.static(path.join(__dirname, "../icons/logo.svg"))
    );

    app.use(express.static(path.join(__dirname, "public/")));

    app.get("/reportBug", function (req, res) {
      res.render("reportBug");
    });

    app.get("/*", function (req, res) {
      res.render("home");
    });
  },
};
