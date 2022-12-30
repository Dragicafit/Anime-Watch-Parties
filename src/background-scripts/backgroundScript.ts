import { BackgroundEvent } from "./backgroundEvents";
import clientTransmission from "./backgroundTransmission";
import { BackgroundUtils } from "./backgroundUtils";

export class BackgroundScript {
  backgroundUtils: BackgroundUtils;
  backgroundEvent: BackgroundEvent;

  public constructor() {
    this.backgroundUtils = new BackgroundUtils();
    this.backgroundEvent = new BackgroundEvent(this);

    clientTransmission.start(this);
  }
}

new BackgroundScript();
