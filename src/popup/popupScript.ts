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

new ClipboardJS(".btn");

function sendInfo(clientTab: ClientTab) {
  console.log("get info");

  const roomnum = clientTab.getRoomnum();
  if (roomnum != null) {
    $("#roomnumURL").val(`https://awp.moe/${roomnum}`);
    $("#copyRoomnumURL").show();
  }
  const onlineUsers = clientTab.getOnlineUsers();
  if (onlineUsers != null) {
    $("#online-users").text(onlineUsers);
  }
}

browser.runtime
  .sendMessage({
    command: "joinTab",
  })
  .catch(clientUtils.reportError);

$("#create").on("click", () => {
  $("#roomnumURL").text("");
  $("#copyRoomnumURL").hide();
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
