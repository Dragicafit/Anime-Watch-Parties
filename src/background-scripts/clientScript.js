const io = require("socket.io-client");
const { ClientContext } = require("./clientContext");
const { ClientUtils } = require("./clientUtils");
const { ClientEvent } = require("./clientEvents");
const { ClientSync } = require("./clientSync");
const transmissionB = require("./clientTransmission-b");

let socket = io.connect("https://localhost:4000", {
  secure: true,
  withCredentials: true,
});
let clientContext = new ClientContext(socket, browser);
let clientUtils = new ClientUtils(clientContext);
let clientSync = new ClientSync(clientContext);
let clientEvent = new ClientEvent(clientContext, clientUtils, clientSync);
transmissionB.start(clientContext, clientUtils, clientEvent, clientSync);
