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

socket.on("changeVideoClient", (data) => {
  setTimeout(() => {
    console.log(`video id is: ${data.videoId}`);

    let url = parseUrl();
    if (
      url.videoId === data.videoId &&
      url.site === data.site &&
      url.location === data.location
    )
      return;

    window.postMessage(
      {
        direction: "from-script-AWP",
        command: "changeVideoClient",
        videoId: data.videoId,
        site: data.site,
        location: data.location,
      },
      window.location.origin
    );
  }, delay);
});
