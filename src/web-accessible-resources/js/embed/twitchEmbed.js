const { TabContext } = require("../tabContext");

class TwitchEmbed {
  /** @type {TabContext} */
  tabContext;

  /** @param {TabContext} tabContext */
  constructor(tabContext) {
    this.tabContext = tabContext;
  }

  startEmbed() {
    console.log("start embed");

    if (this.tabContext.$("#twitchEmbed").length) {
      this.tabContext
        .$("#twitchVideoEmbed > iframe")
        .attr(
          "src",
          `https://player.twitch.tv/?channel=${this.tabContext.tabRoom.roomnum}&parent=${this.tabContext.window.location.hostname}&muted=false`
        );
      this.tabContext
        .$("#twitchChatEmbed")
        .attr(
          "src",
          `https://www.twitch.tv/embed/${this.tabContext.tabRoom.roomnum}/chat?parent=${this.tabContext.window.location.hostname}&darkpopout`
        );
    } else {
      this.tabContext.$("body").append(`<div id="twitchEmbed">
            <div id="twitchMoveEmbed">Click here to move</div>
            <div id="twitchVideoChatEmbed">
              <div id="twitchVideoEmbed">
                <iframe
                  src="https://player.twitch.tv/?channel=${this.tabContext.tabRoom.roomnum}&parent=${this.tabContext.window.location.hostname}&muted=false"
                  frameborder="0"
                  allowfullscreen="true"
                ></iframe>
              </div>
              <iframe
                id="twitchChatEmbed"
                src="https://www.twitch.tv/embed/${this.tabContext.tabRoom.roomnum}/chat?parent=${this.tabContext.window.location.hostname}&darkpopout"
                frameborder="0"
              ></iframe>
            </div>
          </div>`);
    }
    this.tabContext
      .$("#twitchEmbed")
      .draggable({ iframeFix: true, containment: "window" })
      .resizable({
        handles: "all",
        containment: "document",
        start: function (event, ui) {
          $("iframe").css("pointer-events", "none");
        },
        stop: function (event, ui) {
          $("iframe").css("pointer-events", "auto");
        },
      });
    if (!this.tabContext.$(".jw-icon-studio").length) {
      this.tabContext
        .$(".jw-icon-fullscreen")
        .clone()
        .toggleClass("jw-icon-fullscreen jw-icon-studio")
        .attr("aria-label", "Mode Studio")
        .insertBefore(".jw-icon-fullscreen")
        .click(function () {
          studio();
        });
      this.tabContext
        .$(".jw-icon-studio > .jw-svg-icon-fullscreen-on")
        .toggleClass("jw-svg-icon-fullscreen-on jw-svg-icon-studio-on")
        .attr("viewBox", "0 0 20 20")
        .children("path")
        .attr("fill-rule", "evenodd")
        .attr("clip-rule", "evenodd")
        .attr(
          "d",
          "M2 15V5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zm2 0V5h7v10H4zm9 0h3V5h-3v10z"
        );
      this.tabContext
        .$(".jw-icon-studio > .jw-svg-icon-fullscreen-off")
        .toggleClass("jw-svg-icon-fullscreen-off jw-svg-icon-studio-off")
        .attr("viewBox", "0 0 20 20")
        .children("path")
        .attr(
          "d",
          "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h7V3H4zM16 3h-3v14h3a2 2 0 002-2V5a2 2 0 00-2-2z"
        );
    }
  }

  updateDelay() {
    this.tabContext.window.addEventListener("message", (event) => {
      if (
        event.source !==
          this.tabContext.$("#twitchVideoEmbed>iframe")?.[0]?.contentWindow ||
        event.origin !== "https://player.twitch.tv" ||
        event.data?.namespace !== "twitch-embed-player-proxy"
      )
        return;
      if (event.data.eventName === "UPDATE_STATE") {
        let stat = event.data.params?.stats?.videoStats;
        if (stat?.hlsLatencyBroadcaster != null) {
          this.tabContext.tabRoom.delay =
            (streamerDelay + stat.hlsLatencyBroadcaster) * 1000;

          if (stat.videoResolution === "" || stat.videoResolution === "0x0")
            return;
          let resolution = stat.videoResolution.match(/(\d+)x(\d+)/);
          this.tabContext
            .$("#twitchVideoEmbed")
            .css("padding-top", `${(100 * resolution[2]) / resolution[1]}%`);
        }
      }
    });
  }

  studio() {
    console.log("mode studio");

    if (this.tabContext.$(".jw-icon-studio.jw-off").length) {
      this.tabContext.$(".jw-icon-studio").removeClass("jw-off");
      this.tabContext.$("#twitchVideoChatEmbed").resizable("destroy");
      this.tabContext.$("#jwplayer-container").detach().appendTo(".flex-video");
      this.tabContext
        .$("#twitchVideoChatEmbed")
        .detach()
        .appendTo("#twitchEmbed");
      this.tabContext.$("#fullscreenTest").remove();
    } else {
      this.tabContext.$(".jw-icon-studio").addClass("jw-off");
      this.tabContext.$("body").append(`<div id="fullscreenTest"></div>`);
      this.tabContext
        .$("#jwplayer-container")
        .detach()
        .appendTo("#fullscreenTest");
      this.tabContext
        .$("#twitchVideoChatEmbed")
        .detach()
        .appendTo("#fullscreenTest");
      this.tabContext.$("#twitchVideoChatEmbed").resizable({
        handles: "w",
        iframeFix: true,
      });
    }
  }
}

exports.TwitchEmbed = TwitchEmbed;
