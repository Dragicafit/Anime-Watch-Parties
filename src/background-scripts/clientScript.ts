"use strict";

import io from "socket.io-client";
import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";
import { ClientSync } from "./clientSync";
import clientTransmission from "./clientTransmission";
import { ClientUtils } from "./clientUtils";

let socket = io("https://animewatchparties.com");
let clientContext = new ClientContext(socket, new Map(), new Map());
let clientUtils = new ClientUtils(clientContext);
let clientSync = new ClientSync(clientContext, clientUtils);
let clientEvent = new ClientEvent(clientContext, clientUtils, clientSync);
clientSync.clientEvent = clientEvent;
clientTransmission.start(clientContext, clientUtils, clientEvent, clientSync);
