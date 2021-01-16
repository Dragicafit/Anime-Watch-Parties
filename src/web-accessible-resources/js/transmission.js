window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    event.origin !== window.location.origin ||
    event.data?.direction !== "from-content-AWP"
  )
    return;
  switch (event.data.command) {
    case "joinRoom":
      joinRoom(event.data.roomnum);
      break;
    case "askInfo":
      sendInfo();
      break;
    default:
      break;
  }
});

socket.on("changeStateClient", (data) =>
  changeStateClient(data?.time, data?.state)
);
socket.on("getUsers", (data) => getUsers(data?.onlineUsers));
socket.on("unSetHost", () => unSetHost());
socket.on("changeVideoClient", (data) =>
  changeVideoClient(data?.videoId, data?.site, data?.location)
);
