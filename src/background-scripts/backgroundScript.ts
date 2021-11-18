"use strict";

import io from "socket.io-client";
import { ClientContext } from "../client/clientContext";
import { ClientScript } from "../client/clientScript";
import { BackgroundEvent } from "./backgroundEvents";
import { BackgroundListener } from "./backgroundListener";
import { BackgroundSync } from "./backgroundSync";
import clientTransmission from "./backgroundTransmission";
import { BackgroundUtils } from "./backgroundUtils";

export class BackgroundScript {
  clientScript: ClientScript;

  backgroundUtils: BackgroundUtils;
  backgroundSync: BackgroundSync;
  backgroundEvent: BackgroundEvent;

  public constructor() {
    const socket = io("https://animewatchparties.com");
    const backgroundListener = new BackgroundListener(this);
    let clientContext = new ClientContext(
      socket,
      performance,
      backgroundListener
    );
    this.clientScript = new ClientScript(clientContext);
    backgroundListener.setClientScript(this.clientScript);

    this.backgroundUtils = new BackgroundUtils(this.clientScript);
    this.backgroundSync = new BackgroundSync(this.clientScript, this);
    this.backgroundEvent = new BackgroundEvent(this.clientScript, this);

    clientTransmission.start(this.clientScript, this);

    browser.tabs
      .query({})
      .then((tabs) => {
        tabs.forEach((tab) => {
          if (tab.id == null) return;
          this.clientScript.clientUtils.createTab(tab.id);
        });
      })
      .catch(this.clientScript.clientUtils.reportError);
  }
}

new BackgroundScript();