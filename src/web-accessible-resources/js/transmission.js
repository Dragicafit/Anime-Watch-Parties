window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    event.origin !== window.location.origin ||
    event.data?.direction !== "from-content-AWP"
  )
    return;
  switch (event.data.command) {
    case "sendInfo":
      sendInfo(event.data.roomnum, event.data.host);
      break;
    case "openPopupTwitch":
      openPopupTwitch(event.data.roomnum);
      break;
    case "startEmbed":
      startEmbed();
      break;
    case "changeStateClient":
      changeStateClient(event.data.time, event.data.state);
      break;
    case "askState":
      askState();
      break;
    default:
      break;
  }
});
