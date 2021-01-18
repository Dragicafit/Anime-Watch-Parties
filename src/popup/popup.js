let regexRoom = /^\w{1,30}$/;

function chat() {
  $(function () {
    let $userForm = $("#userForm");
    let $roomnum = $("#roomnum");

    function check(nosymbols) {
      this.setCustomValidity("");

      let value = $(this).val();

      if (value === "") {
        this.setCustomValidity("Enter a value");
        return;
      }
      if (value.length > 30) {
        this.setCustomValidity("30 characters max");
        return;
      }
      if (value.length < 1) {
        this.setCustomValidity("1 character min");
        return;
      }
      if (!nosymbols.test(value)) {
        this.setCustomValidity("0-9, a-Z and _ only");
        return;
      }
    }

    $roomnum.on("input", function () {
      check.call(this, regexRoom);
    });

    $userForm.submit((e) => {
      e.preventDefault();

      let roomnum = $roomnum.val();

      if (!regexRoom.test(roomnum)) {
        console.log("ENTER A PROPER ROOM");
        return;
      }
      $roomnum.val("");
      browser.runtime.sendMessage({
        command: "joinRoom",
        roomnum: roomnum,
      });
    });

    console.log("ask info");
    browser.runtime.sendMessage({
      command: "askInfo",
    });
  });
}

function sendInfo(username, roomnum, hostName, onlineUsers) {
  console.log("get info");

  if (username != null) {
    document.getElementById("username").innerHTML = username;
  }
  if (roomnum != null) {
    document.getElementById("roomnum").value = roomnum;
  }
  if (hostName != null) {
    document.getElementById("hostName").innerHTML = hostName;
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
      sendInfo(
        message.username,
        message.roomnum,
        message.hostName,
        message.onlineUsers
      );
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
