import ClipboardJS from "clipboard";
import $ from "jquery";
import browser from "webextension-polyfill";
import {
  eventsBackgroundReceive,
  eventsBackgroundSend,
  SERVER_JOIN_URL,
} from "../background-scripts/backgroundConst";
import { BackgroundUtils } from "../background-scripts/backgroundUtils";
import { ClientContext, ClientSimpleContext } from "../client/clientContext";
import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import { ClientUtils } from "../client/clientUtils";
import "./index.scss";

const clientContext = new ClientSimpleContext(performance);
const clientUtils = new ClientUtils(<ClientContext>clientContext);
const backgroundUtils = new BackgroundUtils(<ClientScript>{
  clientUtils: clientUtils,
});

function scriptLoaded() {
  console.log("scipt loaded");

  console.log("ask info");
  browser.runtime
    .sendMessage({
      command: eventsBackgroundReceive.ASK_INFO,
    })
    .catch(console.error);
}

function showTooltip(elem: Element, msg: string) {
  const ariaLabel = $(elem).attr("aria-label");
  $(elem).attr("aria-label", msg);

  $(elem).one("blur", function name() {
    if (ariaLabel != null) {
      $(elem).attr("aria-label", ariaLabel);
    }
  });
  $(elem).trigger("focus");
}

function fallbackMessage(action: string) {
  var actionMsg = "";
  var actionKey = action === "cut" ? "X" : "C";
  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = "No support :(";
  } else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = "Press ⌘-" + actionKey + " to " + action;
  } else {
    actionMsg = "Press Ctrl-" + actionKey + " to " + action;
  }
  return actionMsg;
}

const clipboard = new ClipboardJS("#copy");
clipboard.on("success", (e) => {
  console.info("Action:", e.action);
  console.info("Text:", e.text);
  console.info("Trigger:", e.trigger);
  showTooltip(e.trigger, "Copied!");
});
clipboard.on("error", (e) => {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
  showTooltip(e.trigger, fallbackMessage(e.action));
});

let clientTab: ClientTab | undefined;
function sendInfo(clientTab: ClientTab) {
  console.log("get info", clientTab);

  const clientRoom = clientTab.getClientRoom();
  if (clientRoom == null) {
    $(".show-with-room").hide();
    $(".show-without-room").show();
  } else {
    $(".show-with-room").show();
    $(".show-without-room").hide();

    $("#roomnumURL").val(`https://${SERVER_JOIN_URL}/${clientRoom.roomnum}`);
    $("#roomnumURL").attr(
      "aria-label",
      `https://${SERVER_JOIN_URL}/${clientRoom.roomnum}`
    );

    $("#online-users").text(clientRoom.onlineUsers);

    if (clientRoom.host) {
      $(".show-host").show();
      $(".show-viewer").hide();
    } else {
      $(".show-host").hide();
      $(".show-viewer").show();
    }
  }

  refreshAdvanced();
}

function refreshAdvanced() {
  let html = "";
  for (const [tabId, clientContextTab] of clientContext.clientTabs) {
    const clientContextRoom = clientContextTab.getClientRoom();
    if (clientContextRoom == null) continue;

    const site = clientContextRoom.getUrl()?.site;
    const path = backgroundUtils.getIcon(site ?? null);

    const time = (clientContextRoom.getCurrTime() * 100) / (25 * 60);
    const action = clientContextRoom.getState() ? "Play" : "Pause";

    html += `<div id="go-to${tabId}" class="BtnGroup d-block ml-0">`;
    html += `<button class="BtnGroup-item btn"
      type="button"
      ><img
        class="octicon"
        src="${path}"
        alt="${site}"
        width="16px"
        height="16px"
      /></button>`;
    html += `<button class="BtnGroup-item btn"
          type="button"
        ><div style="width:40px">${action}</div></button>`;
    html += `<button class="BtnGroup-item btn"
        type="button"
      ><div style="width:60px">${clientContextRoom.roomnum}</div></button>`;
    html += `<button class="BtnGroup-item btn">${clientContextRoom.onlineUsers} online</span>`;

    html += `</div>`;
    html += `<span class="Progress Progress--small mb-1">
        <span class="Progress-item color-bg-success-emphasis" style="width: ${time}%;"></span>
      </span>`;
  }
  if (html === "") {
    html = "<p>All your tabs in a room will appear here.</p>";
  }
  $("#advanced").html(html);
}

browser.runtime
  .sendMessage({
    command: eventsBackgroundReceive.JOIN_TAB,
  })
  .catch(console.error);

$("#create").on("click", () => {
  browser.runtime
    .sendMessage({
      command: eventsBackgroundReceive.CREATE_ROOM,
    })
    .catch(console.error);
});

browser.runtime.onMessage.addListener((message) => {
  switch (message?.command) {
    case eventsBackgroundSend.SEND_INFO:
      const clientContextLocal = ClientContext.complexify(
        message.clientContext,
        performance
      );
      clientContext.clientRooms = clientContextLocal.clientRooms;
      clientContext.clientTabs = clientContextLocal.clientTabs;
      backgroundUtils.getActiveTab().then((tab) => {
        clientTab = undefined;
        if (tab?.id == null) return;
        clientTab = clientContextLocal.clientTabs.get(tab.id);
        if (clientTab == null) return;
        sendInfo(clientTab);
      });
      break;
    case eventsBackgroundReceive.SCRIPT_LOADED:
      scriptLoaded();
      break;
    default:
      break;
  }
});

console.log("ask info");
browser.runtime
  .sendMessage({
    command: eventsBackgroundReceive.ASK_INFO,
  })
  .catch(console.error);

$("#roomnumURL").on("click", function () {
  $(this).trigger("select");
});

$("#advanced-button").on("click", function () {
  if ($(this).attr("aria-selected") === "true") {
    $(this).removeAttr("aria-selected");
    $(".show-with-advanced").hide();
  } else {
    $(this).attr("aria-selected", "true");
    $(".show-with-advanced").show();
  }
});

$("#report-bug").on("click", function () {
  browser.runtime
    .sendMessage({
      command: eventsBackgroundReceive.REPORT_BUG,
    })
    .catch(console.error);
});

browser.tabs
  .query({
    currentWindow: true,
    active: true,
  })
  .then((tabs) => {
    if (!tabs[0].url?.includes("animationdigitalnetwork.fr")) {
      $(".show-activate-adn").hide();
      $(".show-activated-adn").show();
    } else {
      $("#activate-adn").on("click", function () {
        browser.permissions
          .request({
            origins: ["https://animationdigitalnetwork.fr/video/*"],
          })
          .catch(console.error);
      });

      browser.permissions.onAdded.addListener((permissions) => {
        if (
          permissions.origins?.includes("https://animationdigitalnetwork.fr/*")
        ) {
          $(".show-activate-adn").hide();
          $(".show-activated-adn").show();
        }
      });

      browser.permissions.onRemoved.addListener((permissions) => {
        if (
          permissions.origins?.includes("https://animationdigitalnetwork.fr/*")
        ) {
          $(".show-activate-adn").show();
          $(".show-activated-adn").hide();
        }
      });

      browser.permissions
        .contains({
          origins: ["https://animationdigitalnetwork.fr/video/*"],
        })
        .then((result) => {
          if (result) {
            $(".show-activate-adn").hide();
            $(".show-activated-adn").show();
          } else {
            $(".show-activate-adn").show();
            $(".show-activated-adn").hide();
          }
        })
        .catch(console.error);
    }
  })
  .catch(console.error);
