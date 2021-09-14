let regexRoom = /^\w{1,30}$/;

function chat() {
  $(function () {
    let $create = $("#create");
    let $roomnumURL = $("#roomnumURL");

    $create.on("click", (e) => {
      $roomnumURL.text("");
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

function sendInfo(roomnum, onlineUsers) {
  console.log("get info");

  if (roomnum != null) {
    document.getElementById(
      "roomnumURL"
    ).innerText = `https://awp.moe/${roomnum}`;
  }
  if (onlineUsers != null) {
    document.getElementById("online-users").innerHTML = onlineUsers;
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

function scriptLoaded() {
  console.log("scipt loaded");
  chat();
}
