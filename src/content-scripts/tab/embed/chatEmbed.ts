import browser from "webextension-polyfill";
import { TabContext } from "../tabContext";
import { TabSync } from "../tabSync";

export class ChatEmbed {
  private tabContext: TabContext;
  private tabSync: TabSync;

  regexRoom = /^\w{1,30}$/;
  regexMessage = /^.{1,200}$/;

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
      "/src/web-accessible-resources/tab/css/index.css"
    );
    (document.head || document.documentElement).appendChild(css);

    $("body").addClass("awp-inserted");

    $("body").append(`<div id="awp-embed">
      <iframe
        id="awp-chat-embed"
        class="position-fixed right-0 bottom-0 top-0"
        allowTransparency="true"
        frameBorder = "0"
        srcdoc="${`<html>
        <head>
          <link rel='stylesheet' href='${browser.runtime.getURL(
            "/src/web-accessible-resources/chat/css/index.css"
          )}' />
          <script src='${browser.runtime.getURL(
            "/src/web-accessible-resources/chat/js/chat-script.js"
          )}'></script>
        </head>
        <body>
          <div
            class='Box d-flex flex-column'
            data-color-mode='dark'
            data-dark-theme='dark'
          >
            <div class='Box-body input-group'>
              <input
                type='text'
                id='roomnumURL'
                class='form-control color-bg-subtle'
                readonly
              />
              <div class='input-group-button'>
                <button
                  id='copy'
                  class='btn tooltipped tooltipped-no-delay tooltipped-s'
                  aria-label='Click to copy'
                  data-clipboard-target='#roomnumURL'
                >
                  <svg
                    class='octicon octicon-copy'
                    viewBox='-40 0 512 512'
                    width='16px'
                    height='16px'
                  >
                    <path
                      d='M271 512H80c-44.113 0-80-35.887-80-80V161c0-44.113 35.887-80 80-80h191c44.113 0 80 35.887 80 80v271c0 44.113-35.887 80-80 80zM80 121c-22.055 0-40 17.945-40 40v271c0 22.055 17.945 40 40 40h191c22.055 0 40-17.945 40-40V161c0-22.055-17.945-40-40-40zm351 261V80c0-44.113-35.887-80-80-80H129c-11.047 0-20 8.953-20 20s8.953 20 20 20h222c22.055 0 40 17.945 40 40v302c0 11.047 8.953 20 20 20s20-8.953 20-20zm0 0'
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              id='awp-chat-content'
              class='Box-body flex-1 wb-break-word overflow-x-hidden overflow-y-auto'
            ></div>
            <div class='Box-body'>
              <form id='form'>
                <input
                  id='input1'
                  class='form-control input-block mb-2'
                  type='text'
                  placeholder='Send a message'
                  aria-label='Send a message'
                  autocomplete='off'
                />
                <div class='text-right'>
                  <button class='btn btn-primary'>Chat</button>
                </div>
              </form>
            </div>
          </div>
        </body>
      </html>`}"
    ></iframe>
    <button
      id="display-chat"
      class="btn position-fixed"
      data-color-mode="dark"
      data-dark-theme="dark"
    >
      <svg class="octicon" viewBox="0 0 1000 1000" width="24" height="24">
        <path
          d="M71.82 56.1c-27.52 7.5-46.57 25.21-56.96 52.73-4.04 10.58-4.23 12.51-4.81 197.64-.19 102.76.19 199.18 1.15 214.19 1.73 24.82 2.31 28.29 7.89 39.64C30.06 582.43 47 595.9 72.4 602.45c7.89 2.12 12.89 4.62 16.74 8.85l5.2 5.77v157.99l5.97-3.46c3.27-1.92 35.99-25.98 72.74-53.5 125.47-93.91 137.79-102.57 157.03-108.92 6.16-1.92 46.96-2.7 193.4-3.66l185.71-.96 12.12-4.43c28.1-10.2 43.11-26.17 51.57-55.23 2.89-10.01 3.46-25.21 4.43-116.43 1.15-109.31 1.15-108.54 9.81-116.43 4.04-3.66 7.51-3.85 59.85-4.43l55.62-.58V692.12h-82.76l-.38 42.15-.58 42.14-46.17-34.44c-25.4-18.86-51.38-37.14-57.73-40.61-11.35-6.16-11.93-6.16-49.07-7.7-20.59-.96-99.88-1.35-176.09-1.15-131.63.58-138.94.77-144.33 4.23-3.27 1.92-23.29 16.55-44.65 32.72-44.84 33.48-46.57 35.99-27.9 39.64 5.97 1.35 14.43 3.27 18.67 4.43 5.2 1.35 67.93 2.31 190.52 3.08 163 1.15 183.59 1.54 190.71 4.43C694.37 789.5 697.84 792 823.7 886.3l79.86 60.04.96-81.21c1.15-94.1-1.54-84.48 25.59-92.95 28.87-8.85 46.57-25.98 55.81-53.69 3.85-11.74 4.04-15.01 4.04-215.92.19-166.66-.38-205.91-2.5-214.57-5.77-23.48-21.94-44.45-41.18-53.69-19.05-9.24-27.33-10.2-95.26-10.58l-63.89-.39-5-5-5-5-.58-44.84c-.39-39.83-.96-46.57-4.43-57.54-7.7-23.86-25.59-43.11-48.5-52.54l-10.58-4.23-315.61-.38c-267.68-.4-317.14-.02-325.61 2.29zm374.88 81.79c229.59 0 236.13.19 240.55 3.66l4.62 3.66v181.66c0 99.68-.77 184.74-1.54 188.59l-1.54 7.31-194.75.39-194.75.58-12.51 6.16c-6.93 3.46-33.29 21.75-58.7 40.99l-46.18 34.63-.58-41.38-.39-41.38H96.84l-1.15-7.31c-.77-4.04-1.35-87.37-1.35-185.32-.19-131.25.39-179.55 2.12-183.01 4.62-10.39 9.43-11.16 67.16-10.01 25.98.39 153.37.78 283.08.78z"
        />
        <path
          d="M243.48 287.8c-8.85 2.31-16.74 6.93-23.48 14.05-16.74 17.32-16.36 47.15.96 64.28 18.09 18.09 49.07 17.9 66.01-.58 9.24-9.81 12.12-17.7 12.12-32.33 0-15.59-4.43-25.98-14.63-34.64-11.15-9.43-28.47-14.05-40.98-10.78zM403.21 287.8c-21.94 5.58-35.99 23.86-35.99 46.57 0 29.83 29.44 51.96 58.12 43.49 49.46-14.63 43.49-84.87-7.7-90.64-4.81-.38-11.16-.19-14.43.58zM562.55 287.8c-24.63 6.16-40.22 30.6-35.22 55.23 7.5 35.99 51.77 49.07 77.94 22.9 16.17-15.97 18.28-40.99 5.2-59.66-9.43-13.66-32.14-22.32-47.92-18.47z"
        />
      </svg>
    </button>
    </div>`);

    return new Promise<void>((resolve) => {
      $("#awp-chat-embed").one("load", () => {
        let awpChatEmbed = $("#awp-chat-embed").contents();
        this.check();
        awpChatEmbed.find("#form").on("submit", (e) => {
          e.preventDefault();
          this.onChat();
        });
        $("#display-chat").on("click", function () {
          if ($("body").hasClass("awp-inserted")) {
            $("body").removeClass("awp-inserted");
            $("#awp-chat-embed").prop("hidden", true);
          } else {
            $("body").addClass("awp-inserted");
            $("#awp-chat-embed").prop("hidden", false);
          }
        });
        resolve();
      });
    });
  }

  check() {
    const $ = this.tabContext.$;
    let awpChatEmbed = $("#awp-chat-embed").contents();

    awpChatEmbed.find("#input1").on("input", () => {
      let input = <HTMLInputElement>awpChatEmbed.find("#input1").get(0);
      input.setCustomValidity("");

      let value = input.value;

      if (value === "") {
        input.setCustomValidity("Enter a value");
        return;
      }
      if (value.length < 1) {
        input.setCustomValidity("1 character min");
        return;
      }
      if (this.tabContext.name) {
        if (value.length > 200) {
          input.setCustomValidity("200 characters max");
          return;
        }
      } else {
        if (value.length > 30) {
          input.setCustomValidity("30 characters max");
          return;
        }
        if (!this.regexRoom.test(value)) {
          input.setCustomValidity("0-9, a-Z and _ only");
          return;
        }
      }
    });
  }

  onChat() {
    const $ = this.tabContext.$;

    let awpChatEmbed = $("#awp-chat-embed").contents();
    let input = awpChatEmbed.find("#input1").val();
    if (input == null || input == "") {
      return;
    }
    if (this.tabContext.name == null) {
      this.tabSync.sendName(input + "");
    } else {
      this.tabSync.createMessage(input + "");
    }
    awpChatEmbed.find("#input1").val("");
  }

  update() {
    const $ = this.tabContext.$;

    let awpChatEmbed = $("#awp-chat-embed").contents();

    awpChatEmbed.find("#awp-chat-content").empty();
    for (const message of this.tabContext.tabRoom.messages) {
      awpChatEmbed.find("#awp-chat-content").append(`<div class="my-0">
      <div class="ml-n1">
        <span class="text-bold">${message.sender}</span><span>:</span>
        <span>${message.message}</span>
      </div>
    </div>`);
    }

    if (this.tabContext.name == null) {
      awpChatEmbed
        .find("#input1")
        .attr("placeholder", "Choose a username")
        .attr("aria-label", "Choose a username")
        .attr("autocomplete", "on");
    } else {
      awpChatEmbed
        .find("#input1")
        .attr("placeholder", "Send a message")
        .attr("aria-label", "Send a message")
        .attr("autocomplete", "off");
    }

    awpChatEmbed
      .find("#roomnumURL")
      .val(`https://awp.moe/${this.tabContext.tabRoom.roomnum}`);
    awpChatEmbed
      .find("#roomnumURL")
      .attr("aria-label", `https://awp.moe/${this.tabContext.tabRoom.roomnum}`);
  }
}
