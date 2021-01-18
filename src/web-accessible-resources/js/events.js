function changeStateClient(time, state) {
  setTimeout(() => {
    player.getTime().then((clientTime) => {
      console.log(`current time is: ${clientTime}`);
      console.log(`current time server is: ${time}`);
      console.log(`current state server is: ${state}`);

      player.setState(state);

      if (Math.abs(clientTime - time) > 0.2) player.seekTo(time);
    });
  }, delay);
}

function getUsers(newOnlineUsers) {
  console.log(`online: ${newOnlineUsers}`);
  onlineUsers = newOnlineUsers;

  window.postMessage(
    {
      direction: "from-script-AWP",
      command: "sendInfo",
      onlineUsers: newOnlineUsers,
    },
    window.location.origin
  );
}

function unSetHost() {
  console.log("Unsetting host");
  host = false;
}

function changeVideoClient(videoId, site, location) {
  setTimeout(() => {
    console.log(`video id is: ${videoId}`);

    let url = parseUrl();
    if (
      url.videoId === videoId &&
      url.site === site &&
      url.location === location
    )
      return;

    window.postMessage(
      {
        direction: "from-script-AWP",
        command: "changeVideoClient",
        videoId: videoId,
        site: site,
        location: location,
      },
      window.location.origin
    );
  }, delay);
}
