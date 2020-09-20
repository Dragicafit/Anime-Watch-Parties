let tab;
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
      chrome.tabs.sendMessage(tab, {
        command: "joinRoom",
        roomnum: roomnum,
      });
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message?.command === "sendInfo") {
        console.log("get info");

        if (message.username != null) {
          document.getElementById("username").innerHTML = message.username;
        }
        if (message.roomnum != null) {
          document.getElementById("roomnum").value = message.roomnum;
        }
        if (message.hostName != null) {
          document.getElementById("hostName").innerHTML = message.hostName;
        }
        if (message.onlineUsers != null) {
          document.getElementById("online-users").innerHTML =
            message.onlineUsers;
        }
      }
    });
    console.log("ask info");
    chrome.tabs.sendMessage(tab, {
      command: "askInfo",
    });
  });
}

function reportError(error) {
  console.error(`Could not beastify: ${error}`);
}

let listener = (message) => {
  if (message.command === "sciptLoaded") {
    console.log("scipt loaded");
    chrome.runtime.onMessage.removeListener(listener);
    chat();
  }
};
chrome.runtime.onMessage.addListener(listener);

chrome.tabs.query(
  {
    currentWindow: true,
    active: true,
    url: "*://*.wakanim.tv/*",
  },
  (tabs) => {
    if (tabs.length) {
      injectScript(tabs[0]);
    } else {
      chrome.tabs.create({ url: "https://www.wakanim.tv/" }, injectScript);
    }
  }
);

function injectScript(tabId) {
  tab = tabId.id;
  chrome.tabs.executeScript(tab, {
    runAt: "document_end",
    file: "/js/listener.js",
  });
  chrome.runtime.sendMessage({
    command: "createVideoClient",
    tab: tab,
  });
}
