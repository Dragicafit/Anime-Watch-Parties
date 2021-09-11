"use strict";

import io from "socket.io-client";
import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";
import { ClientSync } from "./clientSync";
import clientTransmission from "./clientTransmission";
import { ClientUtils } from "./clientUtils";

let socket = io("https://localhost:4000", {
  secure: true,
  withCredentials: true,
});
let clientContext = new ClientContext(socket, new Map(), new Map());
let clientUtils = new ClientUtils(clientContext);
let clientSync = new ClientSync(clientContext);
let clientEvent = new ClientEvent(clientContext, clientUtils, clientSync);
clientSync.clientEvent = clientEvent;
clientTransmission.start(clientContext, clientUtils, clientEvent, clientSync);
