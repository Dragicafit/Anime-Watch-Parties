import ClipboardJS from "clipboard";
import $ from "jquery";
import "../css/index.scss";

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

$(() => {
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
});
