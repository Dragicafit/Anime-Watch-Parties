window.addEventListener("message", (event) => {
  if (event.source !== window || event.data?.direction !== "from-content-AWP")
    return;
  if (event.data?.command === "joinRoom") {
    socket.emit("joinRoom", event.data, async (err, data) => {
      if (err) {
        if (err === "not connected") {
          popup(() => {
            window.postMessage(event.data, window.location.origin);
          });
        }
        return console.log(err);
      }

      roomnum = data.roomnum;
      username = data.username;
      host = data.host;
      hostName = data.hostName;

      if (host) {
        console.log("You are the new host!");
        changeVideo();
        changeState(await player.getTime(), await player.isPlay());
      } else {
        startEmbed();
      }
      console.log(`send user name after new user ${username}`);
      console.log(`send room number after joinRoom ${roomnum}`);

      sendInfo();
    });
  } else if (event.data?.command === "askInfo") {
    sendInfo();
  }
});

function sendInfo() {
  console.log("send info");

  window.postMessage(
    {
      direction: "from-script-AWP",
      command: "sendInfo",
      roomnum: roomnum,
      username: username,
      hostName: hostName,
      onlineUsers: onlineUsers,
    },
    "*"
  );
}

function popup(callback) {
  let popup = window.open(
    `${server}auth/twitch`,
    "Twitch",
    "width=1024,height=600,scrollbars=yes"
  );
  if (!popup) return;
  let interval = setInterval(() => {
    if (!popup.closed) return;
    clearInterval(interval);

    socket.close();
    setTimeout(() => {
      socket.connect();
      callback();
    }, 1000);
  }, 500);
}
