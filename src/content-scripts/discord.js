(function () {
  const discordToken = window.localStorage.token;
  console.error(window.location, discordToken);
  if (discordToken == null) {
    return;
  }
  browser.runtime
    .sendMessage({
      command: "sendDiscordToken",
      discordToken: JSON.parse(discordToken),
    })
    .catch(console.error);
})();
