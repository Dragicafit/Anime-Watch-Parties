import { ClientScript } from "./../client/clientScript";
import { BackgroundUtils } from "./../background-scripts/backgroundUtils";
import ClipboardJS from "clipboard";
import $ from "jquery";
import { ClientSimpleContext } from "../client/clientContext";
import { ClientContext } from "./../client/clientContext";
import { ClientTab } from "./../client/clientTab";
import { ClientUtils } from "../client/clientUtils";

let clientContext = new ClientSimpleContext(performance);
const clientUtils = new ClientUtils(<any>null);
const backgroundUtils = new BackgroundUtils(<ClientScript>{
  clientUtils: clientUtils,
});

function scriptLoaded() {
  console.log("scipt loaded");

  console.log("ask info");
  browser.runtime
    .sendMessage({
      command: "askInfo",
    })
    .catch(clientUtils.reportError);
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

function sendInfo(clientTab: ClientTab) {
  console.log("get info");

  const clientRoom = clientTab.getClientRoom();
  if (clientRoom == null) {
    $(".show-with-room").hide();
    $(".show-without-room").show();
    return;
  }
  $(".show-with-room").show();
  $(".show-without-room").hide();

  $("#roomnumURL").val(`https://awp.moe/${clientRoom.roomnum}`);
  $("#roomnumURL").attr("aria-label", `https://awp.moe/${clientRoom.roomnum}`);

  $("#online-users").text(clientRoom.onlineUsers);

  if (clientRoom.host) {
    $(".show-host").show();
    $(".show-viewer").hide();
  } else {
    $(".show-host").hide();
    $(".show-viewer").show();
  }
}

browser.runtime
  .sendMessage({
    command: "joinTab",
  })
  .catch(clientUtils.reportError);

$("#create").on("click", () => {
  browser.runtime
    .sendMessage({
      command: "createRoom",
    })
    .catch(clientUtils.reportError);
});

browser.runtime.onMessage.addListener((message) => {
  switch (message?.command) {
    case "sendInfo":
      clientContext = ClientContext.complexify(
        message.clientContext,
        performance
      );
      backgroundUtils.getActiveTab().then((tab) => {
        if (tab?.id == null) return;
        const clientTab = clientContext.clientTabs.get(tab.id);
        if (clientTab == null) return;
        sendInfo(clientTab);
      });
      break;
    case "scriptLoaded":
      scriptLoaded();
      break;
    default:
      break;
  }
});

browser.runtime
  .sendMessage({
    command: "askInfo",
  })
  .catch(clientUtils.reportError);

$("#roomnumURL").on("click", function () {
  $(this).trigger("select");
});
