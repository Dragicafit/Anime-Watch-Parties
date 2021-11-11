"use strict";

import io from "socket.io-client";
import { ClientContext } from "../client/clientContext";
import { ClientScript } from "../client/clientScript";
import { BackgroundEvent } from "./backgroundEvents";
import { BackgroundListener } from "./backgroundListener";
import { BackgroundSync } from "./backgroundSync";
import clientTransmission from "./backgroundTransmission";
import { BackgroundUtils } from "./backgroundUtils";

let socket = io("https://animewatchparties.com");
let backgroundListener = new BackgroundListener();
let clientContext = new ClientContext(socket, performance, backgroundListener);
let clientScript = new ClientScript(clientContext);

let backgroundUtils = new BackgroundUtils(clientScript);
let backgroundSync = new BackgroundSync(clientScript, backgroundUtils);
let backgroundEvent = new BackgroundEvent(clientScript, backgroundUtils);
backgroundListener.setClientScript(clientScript);
backgroundListener.setBackgroundEvent(backgroundEvent);
backgroundListener.setBackgroundSync(backgroundSync);
backgroundListener.setBackgroundUtils(backgroundUtils);

clientTransmission.start(
  clientScript,
  backgroundUtils,
  backgroundEvent,
  backgroundSync
);

browser.tabs
  .query({})
  .then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.id == null) return;
      clientScript.clientUtils.createTab(tab.id);
    });
  })
  .catch(clientScript.clientUtils.reportError);
