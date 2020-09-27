function startEmbed() {
  if ($2("#twitchEmbed").length) {
    $2("#twitchVideoEmbed > iframe").attr(
      "src",
      `https://player.twitch.tv/?channel=${roomnum}&parent=${window.location.hostname}&muted=false`
    );
    $2("#twitchChatEmbed").attr(
      "src",
      `https://www.twitch.tv/embed/${roomnum}/chat?parent=${window.location.hostname}&darkpopout`
    );
  } else {
    $2("body").append(`<div id="twitchEmbed">
            <div id="twitchMoveEmbed">Click here to move</div>
            <div id="twitchVideoChatEmbed">
              <div id="twitchVideoEmbed">
                <iframe
                  src="https://player.twitch.tv/?channel=${roomnum}&parent=${window.location.hostname}&muted=false"
                  frameborder="0"
                  allowfullscreen="true"
                ></iframe>
              </div>
              <iframe
                id="twitchChatEmbed"
                src="https://www.twitch.tv/embed/${roomnum}/chat?parent=${window.location.hostname}&darkpopout"
                frameborder="0"
              ></iframe>
            </div>
          </div>`);
  }
  $2("#twitchEmbed")
    .draggable({ iframeFix: true, containment: "window" })
    .resizable({
      handles: "all",
      iframeFix: true,
      containment: "document",
    });
  if (!$2(".jw-icon-studio").length) {
    $2(".jw-icon-fullscreen")
      .clone()
      .toggleClass("jw-icon-fullscreen jw-icon-studio")
      .attr("aria-label", "Mode Studio")
      .insertBefore(".jw-icon-fullscreen")
      .click(function () {
        studio();
      });
    $2(".jw-icon-studio > .jw-svg-icon-fullscreen-on")
      .toggleClass("jw-svg-icon-fullscreen-on jw-svg-icon-studio-on")
      .attr("viewBox", "0 0 20 20")
      .children("path")
      .attr("fill-rule", "evenodd")
      .attr("clip-rule", "evenodd")
      .attr(
        "d",
        "M2 15V5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zm2 0V5h7v10H4zm9 0h3V5h-3v10z"
      );
    $2(".jw-icon-studio > .jw-svg-icon-fullscreen-off")
      .toggleClass("jw-svg-icon-fullscreen-off jw-svg-icon-studio-off")
      .attr("viewBox", "0 0 20 20")
      .children("path")
      .attr(
        "d",
        "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h7V3H4zM16 3h-3v14h3a2 2 0 002-2V5a2 2 0 00-2-2z"
      );
  }
}

window.addEventListener("message", (event) => {
  if (event.source !== $2("#twitchVideoEmbed>iframe")?.[0]?.contentWindow)
    return;
  let stat = event.data?.params?.stats?.videoStats;
  if (stat?.hlsLatencyBroadcaster != null) {
    delay = (streamerDelay + stat.hlsLatencyBroadcaster) * 1000;

    if (stat.videoResolution === "" || stat.videoResolution === "0x0") return;
    let resolution = stat.videoResolution.match(/(\d+)x(\d+)/);
    $2("#twitchVideoEmbed").css(
      "padding-top",
      `${(100 * resolution[2]) / resolution[1]}%`
    );
  }
});

function studio() {
  if ($2(".jw-icon-studio.jw-off").length) {
    $(".jw-icon-studio").removeClass("jw-off");
    $2("#twitchVideoChatEmbed").resizable("destroy");
    $2("#jwplayer-container").detach().appendTo(".flex-video");
    $2("#twitchVideoChatEmbed").detach().appendTo("#twitchEmbed");
    $2("#fullscreenTest").remove();
  } else {
    $(".jw-icon-studio").addClass("jw-off");
    $2("body").append(`<div id="fullscreenTest"></div>`);
    $2("#jwplayer-container").detach().appendTo("#fullscreenTest");
    $2("#twitchVideoChatEmbed").detach().appendTo("#fullscreenTest");
    $2("#twitchVideoChatEmbed").resizable({
      handles: "w",
      iframeFix: true,
    });
  }
}
