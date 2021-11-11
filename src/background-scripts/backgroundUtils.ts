import { ClientScript } from "../client/clientScript";
import { ClientTab } from "../client/clientTab";
import {
  parseUrlAdn,
  parseUrlCrunchyroll,
  parseUrlFunimation,
  parseUrlNewCrunchyroll,
  parseUrlOldFunimation,
  parseUrlSerieCrunchyroll,
  parseUrlWakanim,
} from "./backgroundConst";

export class BackgroundUtils {
  private clientScript: ClientScript;

  constructor(clientScript: ClientScript) {
    this.clientScript = clientScript;
  }

  getActiveTab() {
    console.log("get active tab");

    return new Promise<browser.tabs.Tab>((resolve) => {
      browser.tabs
        .query({
          currentWindow: true,
          active: true,
        })
        .then((tabs) => {
          if (tabs.length > 0) return resolve(tabs[0]);
          browser.tabs
            .create({ url: "https://www.wakanim.tv/" })
            .then((tab) => resolve(tab))
            .catch(this.clientScript.clientUtils.reportError);
        })
        .catch(this.clientScript.clientUtils.reportError);
    });
  }

  parseUrl(urlString: string) {
    console.log("parse url", urlString);

    const url = new URL(urlString);
    if (url.protocol !== "https:") {
      return null;
    }

    switch (url.host) {
      case "www.wakanim.tv":
        {
          let pathname = url.pathname.match(parseUrlWakanim);
          if (pathname != null) {
            return {
              videoId: pathname.groups!.videoId,
              site: "wakanim",
              location: pathname.groups!.location,
            };
          }
        }
        break;
      case "www.crunchyroll.com":
        {
          let pathname = url.pathname.match(parseUrlCrunchyroll);
          if (pathname != null) {
            return {
              videoId:
                pathname.groups!.serie_name +
                "/episode-" +
                pathname.groups!.media_id,
              site: "crunchyroll",
              location: pathname.groups!.location,
            };
          }
        }
        break;
      case "www.funimation.com":
        {
          let pathname = url.pathname.match(parseUrlFunimation);
          if (pathname != null) {
            return {
              videoId: pathname.groups!.videoId,
              site: "funimation",
              location: pathname.groups!.location,
            };
          }
          pathname = url.pathname.match(parseUrlOldFunimation);
          if (pathname != null) {
            return {
              videoId: pathname.groups!.videoId,
              site: "oldFunimation",
              location: pathname.groups!.location,
            };
          }
        }
        break;
      case "animedigitalnetwork.fr":
        {
          let pathname = url.pathname.match(parseUrlAdn);
          if (pathname != null) {
            return {
              videoId: pathname.groups!.videoId,
              site: "adn",
              location: "fr",
            };
          }
        }
        break;
      case "awp.moe":
        return { site: "awp" };
    }
    return null;
  }

  parseUrlTab(tab: browser.tabs.Tab): Promise<any> {
    const url = tab?.url;
    if (url != null) {
      console.log("parse tab", url);
      const parseUrl = this.parseUrl(url);
      if (parseUrl != null) {
        return Promise.resolve(parseUrl);
      }
    }
    return new Promise((resolve) => {
      if (tab.id == null) {
        resolve(null);
        return;
      }
      this.askUrl(tab, tab.id)
        .then((url2) => {
          console.log("ask url", url2);
          if (url2 == null) {
            resolve(null);
            return;
          }
          resolve(this.parseUrl(url2));
        })
        .catch((error) => {
          this.clientScript.clientUtils.reportError(error);
          resolve(null);
        });
    });
  }

  askUrl(
    tab: browser.tabs.Tab,
    tabId: number
  ): Promise<string | null | undefined> {
    return new Promise((resolve) => {
      let clientUtils = this;
      if (tab.status === "complete") {
        action();
        return;
      }
      browser.tabs.onUpdated.addListener(listener);
      function listener(
        tabId2: number,
        changeInfo: browser.tabs._OnUpdatedChangeInfo
      ) {
        if (tabId != tabId2 || changeInfo?.status !== "complete") {
          return;
        }
        browser.tabs.onUpdated.removeListener(listener);
        action();
      }

      function action() {
        browser.webNavigation
          .getAllFrames({ tabId: tabId })
          .then((details) => {
            for (const detail of details) {
              const url = new URL(detail.url);
              if (
                url.host === "www.crunchyroll.com" &&
                url.pathname === "/affiliate_iframeplayer"
              ) {
                console.log("ask url", url);
                let media_id = url.searchParams.get("media_id");
                if (media_id != null) {
                  clientUtils
                    .crunchyrollMediaIdToUrl(media_id)
                    .then((url2) => resolve(url2))
                    .catch((error) => {
                      clientUtils.clientScript.clientUtils.reportError(error);
                      resolve(null);
                    });
                  return;
                }
              } else if (
                url.host === "beta.crunchyroll.com" &&
                url.pathname.includes("/watch") &&
                detail.frameId === 0
              ) {
                console.log("ask url", url);
                let pathname = url.pathname.match(parseUrlNewCrunchyroll);
                if (pathname != null) {
                  browser.tabs
                    .sendMessage(tabId, {
                      command: "askUrlSerie",
                    })
                    .then((urlSerieString) => {
                      if (urlSerieString == null) {
                        throw new Error("urlSerieString is null");
                      }
                      let urlSerie = new URL(urlSerieString);
                      if (
                        urlSerie.protocol === "https:" &&
                        urlSerie.host === "beta.crunchyroll.com"
                      ) {
                        let pathnameSerie = urlSerie.pathname.match(
                          parseUrlSerieCrunchyroll
                        );
                        if (pathnameSerie != null) {
                          let serie_etp_guid =
                            pathnameSerie.groups!.serie_etp_guid;
                          if (serie_etp_guid != null) {
                            clientUtils
                              .crunchyrollEtpGuidToUrl(
                                pathname!.groups!.etp_guid,
                                serie_etp_guid
                              )
                              .then((url2) => resolve(url2))
                              .catch((error) => {
                                clientUtils.clientScript.clientUtils.reportError(
                                  error
                                );
                                resolve(null);
                              });
                            return;
                          }
                        }
                      }
                      resolve(null);
                    })
                    .catch((error) => {
                      clientUtils.clientScript.clientUtils.reportError(error);
                      setTimeout(action, 500);
                    });
                  return;
                }
              } else if (
                url.host === "www.wakanim.tv" &&
                url.pathname.includes("/v2/catalogue/embeddedplayer/")
              ) {
                console.log("ask url", url);
                resolve(detail.url.replace("embeddedplayer", "episode"));
                return;
              }
            }
            resolve(null);
          })
          .catch((error) => {
            clientUtils.clientScript.clientUtils.reportError(error);
            resolve(null);
          });
      }
    });
  }

  crunchyrollMediaIdToUrl(
    media_id: string
  ): Promise<string | null | undefined> {
    return new Promise((resolve) => {
      this.getSessionId()
        .then((session_id) => {
          if (session_id == null) {
            resolve(null);
            return;
          }
          fetch(
            `https://api.crunchyroll.com/info.0.json?media_id=${media_id}&session_id=${session_id}`
          )
            .then((response) => response.json())
            .then((json) => {
              resolve(json.data.url);
            })
            .catch((error) => {
              this.clientScript.clientUtils.reportError(error);
              resolve(null);
            });
        })
        .catch((error) => {
          this.clientScript.clientUtils.reportError(error);
          resolve(null);
        });
    });
  }

  crunchyrollEtpGuidToUrl(
    etp_guid: string,
    serie_etp_guid: string
  ): Promise<string | null | undefined> {
    return new Promise((resolve) => {
      this.getSessionId()
        .then((session_id) => {
          if (session_id == null) {
            resolve(null);
            return;
          }
          fetch(
            `https://www.crunchyroll.com/ajax/?req=RpcApiSearch_GetSearchCandidates`
          )
            .then((response) => response.text())
            .then((text) => JSON.parse(text.split("\n")[1]))
            .then((json) => {
              for (const serie_info of json.data) {
                if (serie_info.etp_guid === serie_etp_guid) {
                  let series_id = serie_info.id;
                  fetch(
                    `https://api.crunchyroll.com/list_media.0.json?series_id=${series_id}&limit=10000&session_id=${session_id}`
                  )
                    .then((response) => response.json())
                    .then((json2) => {
                      for (const media_info of json2.data) {
                        if (media_info.etp_guid === etp_guid) {
                          resolve(media_info.url);
                          return;
                        }
                      }
                      resolve(null);
                    })
                    .catch((error) => {
                      this.clientScript.clientUtils.reportError(error);
                      resolve(null);
                    });
                  return;
                }
              }
              resolve(null);
            })
            .catch((error) => {
              this.clientScript.clientUtils.reportError(error);
              resolve(null);
            });
        })
        .catch((error) => {
          this.clientScript.clientUtils.reportError(error);
          resolve(null);
        });
    });
  }

  getSessionId(): Promise<string | null | undefined> {
    return new Promise((resolve) => {
      browser.cookies
        .get({
          name: "session_id",
          url: "https://www.crunchyroll.com",
        })
        .then((cookie) => resolve(cookie?.value))
        .catch((error) => {
          this.clientScript.clientUtils.reportError(error);
          resolve(null);
        });
    });
  }

  changeIcon(clientTab: ClientTab | undefined, tab: browser.tabs.Tab) {
    if (clientTab?.getClientRoom() == null) {
      browser.browserAction.setIcon({
        path: "src/icons/desactivate.svg",
      });
      return;
    }
    this.parseUrlTab(tab).then((url) => {
      switch (url?.site) {
        case "wakanim":
          browser.browserAction.setIcon({ path: "src/icons/wakanim.svg" });
          break;
        case "crunchyroll":
          browser.browserAction.setIcon({
            path: "src/icons/crunchyroll.svg",
          });
          break;
        case "funimation":
        case "oldFunimation":
          browser.browserAction.setIcon({
            path: "src/icons/funimation.svg",
          });
          break;
        case "adn":
          browser.browserAction.setIcon({
            path: "src/icons/adn.svg",
          });
          break;
        default:
          browser.browserAction.setIcon({
            path: "src/icons/activate.svg",
          });
      }
    });
  }

  insertScript(tab: browser.tabs.Tab, tabId: number) {
    console.log("insert script");

    browser.webNavigation
      .getAllFrames({ tabId: tabId })
      .then((details) => {
        for (const detail of details) {
          const url = new URL(detail.url);
          let site = this.parseUrl(detail.url)?.site;
          if (
            (site === "wakanim" && detail.frameId === 0) ||
            (url.host === "www.wakanim.tv" &&
              url.pathname.includes("/v2/catalogue/embeddedplayer/")) ||
            (url.host === "static.crunchyroll.com" &&
              (url.pathname === "/vilos-v2/web/vilos/player.html" ||
                url.pathname === "/vilos/player.html")) ||
            (site === "funimation" && detail.frameId === 0) ||
            (url.host === "www.funimation.com" &&
              url.pathname.startsWith("/player/")) ||
            (site === "adn" && detail.frameId === 0)
          ) {
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_end",
                file: "/src/content-scripts/listener.js",
                frameId: detail.frameId,
              })
              .catch(this.clientScript.clientUtils.reportError);
          }
          if (
            url.host === "beta.crunchyroll.com" &&
            url.pathname.includes("/watch/") &&
            detail.frameId === 0
          ) {
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_end",
                file: "/src/content-scripts/listener2.js",
                frameId: detail.frameId,
              })
              .catch(this.clientScript.clientUtils.reportError);
          }
          if (
            this.clientScript.clientContext.clientTabs.get(tabId)?.getHost() !==
            true
          ) {
            if (site === "awp" && detail.frameId === 0) {
              browser.tabs
                .executeScript(tabId, {
                  runAt: "document_end",
                  file: "/src/content-scripts/listener3.js",
                  frameId: detail.frameId,
                })
                .catch(this.clientScript.clientUtils.reportError);
            }
          }
        }
      })
      .catch(this.clientScript.clientUtils.reportError);
  }

  convertUrl(
    url: {
      site: string;
      location: string | undefined;
      videoId: string;
    },
    oldUrl:
      | {
          site: string;
          location: string | undefined;
          videoId: string;
        }
      | undefined
  ): void {
    console.log("old url is", oldUrl);
    if (oldUrl?.site === url.site && oldUrl?.videoId === url.videoId) {
      return;
    }

    switch (url.site) {
      case "crunchyroll":
        if (oldUrl?.site === "crunchyroll" && oldUrl?.location != null) {
          url.location = oldUrl.location;
        }
        break;
      case "funimation":
        if (oldUrl?.site === "funimation" && oldUrl?.location != null) {
          url.location = oldUrl.location;
        }
        break;
      default:
        return;
    }
  }
}
