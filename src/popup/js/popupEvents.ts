import $ from "jquery";
import { SERVER_JOIN_URL } from "../../background-scripts/backgroundConst";
import { ClientContext } from "../../client-new/clientContext";
import { ClientTab } from "../../client-new/clientTab";

export class PopupEvents {
  popupContext: ClientContext;

  constructor(popupContext: ClientContext) {
    this.popupContext = popupContext;
  }

  sendInfo(clientTab: ClientTab) {
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

    // this.refreshAdvanced();
  }

  // refreshAdvanced() {
  //   let html = "";
  //   for (const [tabId, clientContextTab] of this.clientScript.clientContext
  //     .clientTabs) {
  //     const clientContextRoom = clientContextTab.getClientRoom();
  //     if (clientContextRoom == null) continue;

  //     const site = clientContextRoom.getUrl()?.site;
  //     const path = backgroundUtils.getIcon(site ?? null);

  //     const time = (clientContextRoom.getCurrTime() * 100) / (25 * 60);
  //     const action = clientContextRoom.getState() ? "Play" : "Pause";

  //     html += `<div id="go-to${tabId}" class="BtnGroup d-block ml-0">`;
  //     html += `<button class="BtnGroup-item btn"
  //     type="button"
  //     ><img
  //       class="octicon"
  //       src="${path}"
  //       alt="${site}"
  //       width="16px"
  //       height="16px"
  //     /></button>`;
  //     html += `<button class="BtnGroup-item btn"
  //         type="button"
  //       ><div style="width:40px">${action}</div></button>`;
  //     html += `<button class="BtnGroup-item btn"
  //       type="button"
  //     ><div style="width:60px">${clientContextRoom.roomnum}</div></button>`;
  //     html += `<button class="BtnGroup-item btn">${clientContextRoom.onlineUsers} online</span>`;

  //     html += `</div>`;
  //     html += `<span class="Progress Progress--small mb-1">
  //       <span class="Progress-item color-bg-success-emphasis" style="width: ${time}%;"></span>
  //     </span>`;
  //   }
  //   if (html === "") {
  //     html = "<p>All your tabs in a room will appear here.</p>";
  //   }
  //   $("#advanced").html(html);
  // }
}
