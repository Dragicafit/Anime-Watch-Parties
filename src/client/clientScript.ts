import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";
import { ClientSync } from "./clientSync";
import clientTransmission from "./clientTransmission";
import { ClientUtils } from "./clientUtils";

export class ClientScript {
  clientContext: ClientContext;
  clientUtils: ClientUtils;
  clientSync: ClientSync;
  clientEvent: ClientEvent;

  public constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
    this.clientUtils = new ClientUtils(this.clientContext);
    this.clientSync = new ClientSync(this.clientContext, this.clientUtils);
    this.clientEvent = new ClientEvent(
      this.clientContext,
      this.clientUtils,
      this.clientSync
    );
    this.clientSync.clientEvent = this.clientEvent;
    clientTransmission.start(this.clientContext, this.clientEvent);
  }
}
