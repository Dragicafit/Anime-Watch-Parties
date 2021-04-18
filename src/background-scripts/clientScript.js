"use strict";

const io = require("socket.io-client");
const { ClientContext } = require("./clientContext");
const { ClientUtils } = require("./clientUtils");
const { ClientEvent } = require("./clientEvents");
const { ClientSync } = require("./clientSync");
const clientTransmission = require("./clientTransmission");

let socket = io.connect("https://localhost:4000", {
  secure: true,
  withCredentials: true,
});
let clientContext = new ClientContext(socket, browser, new Map(), new Map());
let clientUtils = new ClientUtils(clientContext);
let clientSync = new ClientSync(clientContext);
let clientEvent = new ClientEvent(clientContext, clientUtils, clientSync);
clientSync.clientEvent = clientEvent;
clientTransmission.start(clientContext, clientUtils, clientEvent, clientSync);
