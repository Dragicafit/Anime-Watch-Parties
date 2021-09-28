import {
  parseUrlAdn,
  parseUrlCrunchyroll,
  parseUrlFunimation,
  parseUrlNewCrunchyroll,
  parseUrlNewFunimation,
  parseUrlSerieCrunchyroll,
  parseUrlWakanim,
} from "./clientConst";
import { ClientContext } from "./clientContext";
import { ClientTab } from "./clientTab";

export class ClientUtils {
  clientContext: ClientContext;

  constructor(clientContext: ClientContext) {
    this.clientContext = clientContext;
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
            .catch(this.reportError);
        })
        .catch(this.reportError);
    });
  }

  joinTab(tab: browser.tabs.Tab, tabId: number) {
    if (!this.clientContext.clientTabs.has(tabId)) {
      this.clientContext.clientTabs.set(
        tabId,
        new ClientTab(this.clientContext)
      );
    }
    this.changeIcon(tabId, tab);
    this.insertScript(tab, tabId);
  }

  parseUrl(url: string) {
    console.log("parse url", url);

    let pathname = url.match(parseUrlWakanim);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "wakanim",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlCrunchyroll);
    if (pathname != null) {
      return {
        videoId:
          pathname.groups!.serie_name + "/episode-" + pathname.groups!.media_id,
        site: "crunchyroll",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlFunimation);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "funimation",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlNewFunimation);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "newFunimation",
        location: pathname.groups!.location,
      };
    }
    pathname = url.match(parseUrlAdn);
    if (pathname != null) {
      return {
        videoId: pathname.groups!.videoId,
        site: "adn",
        location: "fr",
      };
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
          this.reportError(error);
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
                      clientUtils.reportError(error);
                      resolve(null);
                    });
                  return;
                }
              } else if (
                url.host === "beta.crunchyroll.com" &&
                url.pathname.includes("/watch")
              ) {
                console.log("ask url", url);
                let pathname = url.pathname.match(parseUrlNewCrunchyroll);
                if (pathname != null) {
                  browser.tabs
                    .sendMessage(tabId, {
                      command: "askUrlSerie",
                    })
                    .then((urlSerie) => {
                      let pathnameSerie = urlSerie.match(
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
                              clientUtils.reportError(error);
                              resolve(null);
                            });
                          return;
                        }
                      }
                      resolve(null);
                    })
                    .catch((error) => {
                      clientUtils.reportError(error);
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
            clientUtils.reportError(error);
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
              this.reportError(error);
              resolve(null);
            });
        })
        .catch((error) => {
          this.reportError(error);
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
                      this.reportError(error);
                      resolve(null);
                    });
                  return;
                }
              }
              resolve(null);
            })
            .catch((error) => {
              this.reportError(error);
              resolve(null);
            });
        })
        .catch((error) => {
          this.reportError(error);
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
          this.reportError(error);
          resolve(null);
        });
    });
  }

  changeIcon(tabId: number, tab: browser.tabs.Tab) {
    if (!this.clientContext.clientTabs.has(tabId)) {
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
        case "newFunimation":
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
          if (
            [
              "www.wakanim.tv",
              "static.crunchyroll.com",
              "www.funimation.com",
              "animedigitalnetwork.fr",
            ].includes(url.host)
          ) {
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_end",
                file: "/src/content-scripts/listener.js",
                frameId: detail.frameId,
              })
              .catch(this.reportError);
          }
          if (url.host === "beta.crunchyroll.com") {
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_end",
                file: "/src/content-scripts/listener2.js",
                frameId: detail.frameId,
              })
              .catch(this.reportError);
          }
        }
      })
      .catch(this.reportError);
  }

  reportError(error: any) {
    console.error("error:", error);
  }
}
