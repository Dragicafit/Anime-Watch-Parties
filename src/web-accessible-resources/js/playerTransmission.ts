import { eventsBackgroundSend } from "../../background-scripts/backgroundConst";
import { PlayerContext } from "./playerContext";
import { PlayerEvents } from "./playerEvents";

export default {
  start: function (tabContext: PlayerContext, tabEvent: PlayerEvents) {
    tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !== tabContext.window ||
        event.origin !== tabContext.window.location.origin ||
        event.data?.direction !== "from-content-AWP"
      )
        return;
      switch (event.data.command) {
        case eventsBackgroundSend.SEND_INFO:
          tabEvent.sendInfo(event.data.clientRoom);
          break;
        case eventsBackgroundSend.CHANGE_STATE_CLIENT:
          tabEvent.changeStateClient(event.data.time, event.data.state);
          break;
        case eventsBackgroundSend.ASK_STATE:
          tabEvent.askState();
          break;
        default:
          break;
      }
    });
  },
};
