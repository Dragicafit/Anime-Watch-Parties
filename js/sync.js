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
