socket.on("changeStateClient", (data) => {
  setTimeout(async () => {
    let clientTime = await player.getTime();

    console.log(`current time is: ${clientTime}`);
    console.log(`current time server is: ${data.time}`);
    console.log(`current state server is: ${data.state}`);

    player.setState(data.state);

    if (Math.abs(clientTime - data.time) > 0.2) player.seekTo(data.time);
  }, delay);
});

socket.on("getUsers", (data) => {
  console.log(`online: ${data.onlineUsers}`);
  onlineUsers = data.onlineUsers;

  window.postMessage(
    {
      direction: "from-script-AWP",
      command: "sendInfo",
      onlineUsers: onlineUsers,
    },
    window.location.origin
  );
});

socket.on("unSetHost", () => {
  console.log("Unsetting host");
  host = false;
});

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
