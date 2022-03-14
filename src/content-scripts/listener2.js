(function () {
  if (window.hasRun2) {
    console.log("already running 2");
    return;
  }
  window.hasRun2 = true;

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    message.direction = "from-content-AWP";
    if (message.command === "askUrlSerie") {
      console.log("ask url serie");
      sendResponse(
        document.head.querySelector("[property='video:series'][content]")
          .content
      );
      return;
    }
    sendResponse(null);
  });

  console.log("send info video");

  let titleEpisode = document.head.querySelector(
    "[property='og:title'][content]"
  )?.content;
  let urlSerie = document.head.querySelector(
    "[property='video:series'][content]"
  )?.content;
  let urlEpisode = document.head.querySelector(
    "[property='og:url'][content]"
  )?.content;
  let videoDuration = document.head.querySelector(
    "[property='video:duration'][content]"
  )?.content;

  browser.runtime.sendMessage({
    command: "sendInfoVideo",
    titleEpisode: titleEpisode,
    urlSerie: urlSerie,
    urlEpisode: urlEpisode,
    videoDuration: videoDuration,
  });
})();
