import $ from "jquery";
import io from "socket.io-client";
import browser from "webextension-polyfill";
import {
  AWP_TOKEN,
  eventsBackgroundReceive,
  SERVER_URL,
} from "../../background-scripts/backgroundConst";
import { ClientContext } from "../../client-new/clientContext";
import { ClientScript } from "../../client-new/clientScript";
import { ClientUtils } from "../../client-new/clientUtils";
import { eventsServerReceive, IoCallback } from "../../server/io/ioConst";
import "../index.scss";
import { PopupEvents } from "./popupEvents";
import { PopupListener } from "./popupListener";
import popupTransmission from "./popupTransmission";
import { PopupUtils } from "./popupUtils";

export class PopupScript {
  private clientScript: ClientScript;

  popupEvents: PopupEvents;
  clientUtils: ClientUtils;
  popupUtils: PopupUtils;

  public constructor() {
    const socket = io(SERVER_URL);

    const popupListener: PopupListener = new PopupListener(this);
    let clientContext = new ClientContext(
      socket,
      window.performance,
      popupListener
    );
    this.clientScript = new ClientScript(clientContext);

    this.popupEvents = new PopupEvents(clientContext);

    this.clientUtils = new ClientUtils(clientContext);
    this.popupUtils = new PopupUtils();

    popupTransmission.start(this.clientScript, clientContext);

    popupListener.getToken().then((token) => {
      if (!token) {
        socket.emit(eventsServerReceive.AUTH, <IoCallback>((err, data) => {
          if (data?.token) {
            localStorage.setItem(AWP_TOKEN, data?.token);
          }
          this.clientScript.clientSync.askInfo(clientContext.clientTab);
        }));
      } else {
        this.clientScript.clientSync.askInfo(clientContext.clientTab);
      }
    });

    //FIXME remove
    browser.runtime
      .sendMessage({
        command: eventsBackgroundReceive.JOIN_TAB,
      })
      .catch(console.error);

    this.popupUtils
      .getActiveTab()
      .then((tab) => {
        if (!tab?.url?.includes("animationdigitalnetwork.fr")) {
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
              permissions.origins?.includes(
                "https://animationdigitalnetwork.fr/*"
              )
            ) {
              $(".show-activate-adn").hide();
              $(".show-activated-adn").show();
            }
          });

          browser.permissions.onRemoved.addListener((permissions) => {
            if (
              permissions.origins?.includes(
                "https://animationdigitalnetwork.fr/*"
              )
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
  }
}

new PopupScript();
