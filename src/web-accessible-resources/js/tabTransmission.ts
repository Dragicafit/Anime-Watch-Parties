const { TwitchEmbed } = require("./embed/twitchEmbed");
const { TabContext } = require("./tabContext");
const { TabEvents } = require("./tabEvents");
const { TabSync } = require("./tabSync");

module.exports = {
  /** @param {TabContext} tabContext @param {TabEvents} tabEvent @param {TwitchEmbed} twitchEmbed */
  start: function (tabContext, tabEvent, twitchEmbed) {
    tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !== tabContext.window ||
        event.origin !== tabContext.window.location.origin ||
        event.data?.direction !== "from-content-AWP"
      )
        return;
      switch (event.data.command) {
        case "sendInfo":
          tabEvent.sendInfo(event.data.roomnum, event.data.host);
          break;
        case "openPopupTwitch":
          tabEvent.openPopupTwitch(event.data.roomnum);
          break;
        case "startEmbed":
          twitchEmbed.startEmbed();
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
