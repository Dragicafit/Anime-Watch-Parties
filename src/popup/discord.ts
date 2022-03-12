import browser from "webextension-polyfill";

document.querySelector("#updatebtn")?.addEventListener("click", () => {
  browser.permissions
    .request({
      origins: ["https://discord.com/channels/*"],
    })
    .then((response) => {
      if (response) {
        browser.runtime.sendMessage({
          command: "injectDiscord",
        });
      }
    });
});
