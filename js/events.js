function changeState(currTime, state) {
  socket.emit("changeStateServer", {
    time: currTime,
    state: state,
  });
}

socket.on("changeStateClient", (data) => {
  setTimeout(async () => {
    let clientTime = await player.getTime();

    console.log(`current time is: ${clientTime}`);
    console.log(`current time server is: ${data.time}`);
    console.log(`current state server is: ${data.state}`);

    player.setState(data.state);

    if (clientTime < data.time - 0.2 || clientTime > data.time + 0.2)
      player.seekTo(data.time);
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
    "*"
  );
});
