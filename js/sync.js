function parseUrl() {
  let pathname = window.location.href.match(parseUrlWakanim);
  if (pathname == null) return { location: "fr" };
  return { videoId: Number.parseInt(pathname[2], 10), location: pathname[1] };
}

function idParse() {
  return parseUrl().videoId;
}

function changeVideoParse(roomnum) {
  changeVideo(roomnum, idParse());
}

function changeVideo(roomnum, videoId) {
  console.log(`change video to ${videoId}`);

  let time = getTime();
  console.log(`The time is this man: ${time}`);
  socket.emit("changeVideoServer", {
    room: roomnum,
    videoId: videoId,
    time: time,
  });
}

socket.on("changeVideoClient", (data) => {
  setTimeout(() => {
    console.log(`video id is: ${data.videoId}`);
    id = data.videoId;

    let url = parseUrl();

    if (url.videoId === id) return;

    window.postMessage(
      {
        direction: "from-script-AWP",
        command: "changeVideoClient",
        videoId: id,
        location: url.location,
      },
      "*"
    );
  }, delay);
});
