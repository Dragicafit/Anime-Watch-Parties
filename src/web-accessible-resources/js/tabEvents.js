const { TabContext } = require("./tabContext");
const { TabSync } = require("./tabSync");

class TabEvents {
  /** @type {TabContext} */
  tabContext;
  /** @type {TabSync} */
  tabSync;
  /** @type {Window} */
  popupTwitch;

  /** @param {TabContext} tabContext @param {TabSync} tabSync */
  constructor(tabContext, tabSync) {
    this.tabContext = tabContext;
    this.tabSync = tabSync;
  }

  changeStateClient(time, state) {
    console.log("change state client");

    setTimeout(() => {
      this.tabContext.playerAWP.getTime().then((clientTime) => {
        console.log(`current time is: ${clientTime}`);
        console.log(`current time server is: ${time}`);
        console.log(`current state server is: ${state}`);

        this.tabContext.playerAWP.setState(state);

        if (Math.abs(clientTime - time) > 0.2)
          this.tabContext.playerAWP.seekTo(time);
      });
    }, this.tabContext.tabRoom.delay);
  }

  openPopupTwitch(roomnum) {
    console.log("open popup twitch");

    if (this.popupTwitch == null || this.popupTwitch.closed) {
      this.popupTwitch = this.tabContext.window.open(
        `${this.tabContext.server}/auth/twitch`,
        "Twitch",
        "width=1024,height=600,scrollbars=yes"
      );
    } else {
      return this.popupTwitch.focus();
    }
    if (this.popupTwitch == null) return;

    this.tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !== this.popupTwitch ||
        event.origin !== this.tabContext.server ||
        event.data?.direction !== "from-popupTwitch-AWP"
      )
        return;
      if (event.data.command === "success") {
        this.popupTwitch.close();
        this.tabContext.window.postMessage(
          {
            direction: "from-script-AWP",
            command: "restartSocket",
            roomnum: roomnum,
          },
          this.tabContext.window.location.origin
        );
      }
    });
  }

  sendInfo(roomnum, host) {
    console.log("send info");

    if (roomnum != null) this.tabContext.tabRoom.roomnum = roomnum;
    if (host != null) this.tabContext.tabRoom.host = host;
  }

  askState() {
    console.log("ask state");

    this.tabContext.playerAWP.getTime().then((time) => {
      this.tabContext.playerAWP.isPlay().then((state) => {
        this.tabSync.sendState(time, state);
      });
    });
  }
}

exports.TabEvents = TabEvents;
