import { TabSync } from "./../tabSync";
import browser from "webextension-polyfill";
import { TabContext } from "../tabContext";

export class TwitchEmbed {
  private tabContext: TabContext;
  private tabSync: TabSync;

  constructor(tabContext: TabContext, tabSync: TabSync) {
    this.tabContext = tabContext;
    this.tabSync = tabSync;
  }

  startEmbed() {
    console.log("start embed");

    const $ = this.tabContext.$;

    let css = document.createElement("link");
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = browser.runtime.getURL(
      "/src/web-accessible-resources/css/index.css"
    );
    (document.head || document.documentElement).appendChild(css);

    $("body").addClass("awp-inserted");
    if (!$("#fullscreenTest").length) {
      $("body").append(`<div id="twitchEmbed"><div
      id="twitchChatEmbed"
      class="Box d-flex flex-column position-fixed right-0 bottom-0 top-0"
      data-color-mode="dark" data-dark-theme="dark"
    >
      <div
        id="twitchVideoChatEmbed"
        class="Box-body flex-1 wb-break-word overflow-x-hidden overflow-y-auto"
      ></div>
      <div id="twitchVideoChatEmbed2" class="Box-body">
        <form id="form">
          <input
            id="input1"
            class="form-control input-block mb-2"
            type="text"
            placeholder="Send a message"
            aria-label="Send a message"
          />
          <div class="text-right">
            <button class="btn btn-primary">Chat</button>
          </div>
        </form>
      </div>
    </div>
    <button id="display-chat" class="btn position-fixed"
    data-color-mode="dark" data-dark-theme="dark">
      <img
        class="octicon"
        src="${browser.runtime.getURL("/src/icons/message.svg")}"
        alt="Copy to clipboard"
        width="24px"
        height="24px"
      />
    </button></div>`);
      $("#form").on("submit", (e) => {
        e.preventDefault();
        this.onChat();
      });
      $("#display-chat").on("click", function () {
        if ($("body").hasClass("awp-inserted")) {
          $("body").removeClass("awp-inserted");
          $("#twitchChatEmbed").prop("hidden", true);
        } else {
          $("body").addClass("awp-inserted");
          $("#twitchChatEmbed").prop("hidden", false);
        }
      });
    }
    // if (!$(".jw-icon-studio").length) {
    //   this.tabContext
    //     .$(".jw-icon-fullscreen")
    //     .clone()
    //     .toggleClass("jw-icon-fullscreen jw-icon-studio")
    //     .attr("aria-label", "Mode Studio")
    //     .insertBefore(".jw-icon-fullscreen")
    //     .click(() => {
    //       this.studio();
    //     });
    //   this.tabContext
    //     .$(".jw-icon-studio > .jw-svg-icon-fullscreen-on")
    //     .toggleClass("jw-svg-icon-fullscreen-on jw-svg-icon-studio-on")
    //     .attr("viewBox", "0 0 20 20")
    //     .children("path")
    //     .attr("fill-rule", "evenodd")
    //     .attr("clip-rule", "evenodd")
    //     .attr(
    //       "d",
    //       "M2 15V5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zm2 0V5h7v10H4zm9 0h3V5h-3v10z"
    //     );
    //   this.tabContext
    //     .$(".jw-icon-studio > .jw-svg-icon-fullscreen-off")
    //     .toggleClass("jw-svg-icon-fullscreen-off jw-svg-icon-studio-off")
    //     .attr("viewBox", "0 0 20 20")
    //     .children("path")
    //     .attr(
    //       "d",
    //       "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h7V3H4zM16 3h-3v14h3a2 2 0 002-2V5a2 2 0 00-2-2z"
    //     );
    // }
  }

  onChat() {
    const $ = this.tabContext.$;

    let input = $("#input1").val();
    if (input == null || input == "") {
      return;
    }
    if (this.tabContext.name == null) {
      this.tabSync.sendName(input + "");
    } else {
      this.tabSync.createMessage(input + "");
    }
    $("#input1").val("");
  }

  update() {
    const $ = this.tabContext.$;

    $("#twitchVideoChatEmbed").empty();
    for (const message of this.tabContext.tabRoom.messages) {
      $("#twitchVideoChatEmbed").append(`<div class="my-0">
      <div class="ml-n1">
        <span class="text-bold">${message.sender}</span><span>:</span>
        <span>${message.message}</span>
      </div>
    </div>`);
    }
  }

  studio() {
    console.log("mode studio");

    const $ = this.tabContext.$;

    if ($(".jw-icon-studio.jw-off").length) {
      $(".jw-icon-studio").removeClass("jw-off");
      $("#jwplayer-container").detach().appendTo(".flex-video");
      this.tabContext
        .$("#twitchVideoChatEmbed")
        .detach()
        .appendTo("#twitchChatEmbed");
      $("#fullscreenTest").remove();
    } else {
      $(".jw-icon-studio").addClass("jw-off");
      $("body").append(`<div id="fullscreenTest"></div>`);
      this.tabContext
        .$("#jwplayer-container")
        .detach()
        .appendTo("#fullscreenTest");
      this.tabContext
        .$("#twitchVideoChatEmbed")
        .detach()
        .appendTo("#fullscreenTest");
    }
  }
}
