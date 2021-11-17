import { TabContext } from "./tabContext";
import { TabEvents } from "./tabEvents";

export default {
  start: function (tabContext: TabContext, tabEvent: TabEvents) {
    tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !== tabContext.window ||
        event.origin !== tabContext.window.location.origin ||
        event.data?.direction !== "from-content-AWP"
      )
        return;
      switch (event.data.command) {
        case "sendInfo":
          tabEvent.sendInfo(event.data.clientRoom);
          break;
        case "changeStateClient":
          tabEvent.changeStateClient(event.data.time, event.data.state);
          break;
        case "askState":
          tabEvent.askState();
          break;
        default:
          break;
      }
    });
  },
};
