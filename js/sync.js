function parseUrl() {
  let pathname = window.location.href.match(parseUrlWakanim);
  if (pathname != null) {
    return {
      videoId: pathname.groups.videoId,
      site: "wakanim",
      location: pathname.groups.location,
    };
  }
  pathname = window.location.href.match(parseUrlCrunchyroll);
  if (pathname != null) {
    return {
      videoId: pathname.groups.videoId,
      site: "crunchyroll",
      location: pathname.groups.location,
    };
  }
  return {};
}

async function changeVideo() {
  let time = await player.getTime();
  let url = parseUrl();

  console.log(`change video to ${url.videoId}`);
  console.log(`The time is this man: ${time}`);
  socket.emit("changeVideoServer", {
    room: roomnum,
    videoId: url.videoId,
    site: url.site,
    location: url.location,
    time: time,
  });
}

function changeState(currTime, state) {
  socket.emit("changeStateServer", {
    time: currTime,
    state: state,
  });
}

function syncClient() {
  socket.emit("syncClient");
}

function joinRoom(newRoomnum) {
  socket.emit("joinRoom", { roomnum: newRoomnum }, async (err, data) => {
    if (err) {
      if (err === "not connected") {
        openPopupTwitch(() => {
          window.postMessage(
            { command: joinRoom, roomnum: newRoomnum },
            window.location.origin
          );
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
}

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
    window.location.origin
  );
}

function openPopupTwitch(callback) {
  if (popupTwitch == null || popupTwitch.closed) {
    popupTwitch = window.open(
      `${server}/auth/twitch`,
      "Twitch",
      "width=1024,height=600,scrollbars=yes"
    );
  } else {
    return popupTwitch.focus();
  }
  if (popupTwitch == null) return;

  window.addEventListener("message", (event) => {
    if (
      event.source !== popupTwitch ||
      event.origin !== server ||
      event.data?.direction !== "from-popupTwitch-AWP"
    )
      return;
    if (event.data.command === "success") {
      popupTwitch.close();
      socket.close();
      setTimeout(() => {
        socket.connect();
        callback();
      }, 100);
    }
  });
}
