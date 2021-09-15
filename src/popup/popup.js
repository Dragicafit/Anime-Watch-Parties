function scriptLoaded() {
  console.log("scipt loaded");

  $(function () {
    $("#create").on("click", (e) => {
      $("#roomnumURL").text("");
      $("#copyRoomnumURL").hide();
      browser.runtime.sendMessage({
        command: "createRoom",
      });
    });

    console.log("ask info");
    browser.runtime.sendMessage({
      command: "askInfo",
    });
  });
}

new ClipboardJS(".btn");

function sendInfo(roomnum, onlineUsers) {
  console.log("get info");

  if (roomnum != null) {
    $("#roomnumURL").val(`https://awp.moe/${roomnum}`);
    $("#copyRoomnumURL").show();
  }
  if (onlineUsers != null) {
    $("#online-users").text(onlineUsers);
  }
}

browser.runtime.sendMessage({
  command: "insertScript",
});

browser.runtime.onMessage.addListener((message) => {
  switch (message?.command) {
    case "sendInfo":
      sendInfo(message.roomnum, message.onlineUsers);
      break;
    case "scriptLoaded":
      scriptLoaded();
      break;
    default:
      break;
  }
});

function reportError(error) {
  console.error(`Could not beastify: ${error}`);
}
