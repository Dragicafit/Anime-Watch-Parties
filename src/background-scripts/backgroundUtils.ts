import browser from "webextension-polyfill";
import { SupportedSite } from "../server/io/ioConst";
import {
  parseUrlAdn,
  parseUrlCrunchyroll,
  parseUrlFunimation,
  parseUrlNewCrunchyroll,
  parseUrlOldFunimation,
  parseUrlWakanim,
  SERVER_JOIN_URL,
} from "./backgroundConst";

export class BackgroundUtils {
  private urlFromCrunchyrollBetaToCrunchyroll: Map<string, string>;

  constructor() {
    this.urlFromCrunchyrollBetaToCrunchyroll = new Map();
  }

  getActiveTab() {
    return new Promise<browser.Tabs.Tab | null>((resolve) => {
      browser.tabs
        .query({
          currentWindow: true,
          active: true,
        })
        .then((tabs) => {
          if (tabs.length > 0) return resolve(tabs[0]);
          resolve(null);
        })
        .catch((error) => console.error(...this.saveError(error)));
    });
  }

  parseUrl(urlString: string): {
    videoId?: string;
    site: SupportedSite | "awp";
    location?: string;
  } | null {
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
              videoId: pathname.groups!["videoId"],
              site: "wakanim",
              location: pathname.groups!["location"],
            };
          }
        }
        break;
      case "beta.crunchyroll.com":
      case "www.crunchyroll.com":
      case "crunchyroll.com":
        {
          let pathname = url.pathname.match(parseUrlNewCrunchyroll);
          if (pathname != null) {
            return {
              videoId: pathname.groups!["etp_guid"],
              site: "crunchyroll",
              location: pathname.groups!["location"],
            };
          }
        }
        break;
      case "www.funimation.com":
        {
          let pathname = url.pathname.match(parseUrlFunimation);
          if (pathname != null) {
            return {
              videoId: pathname.groups!["videoId"],
              site: "funimation",
              location: pathname.groups!["location"],
            };
          }
          pathname = url.pathname.match(parseUrlOldFunimation);
          if (pathname != null) {
            return {
              videoId: pathname.groups!["videoId"],
              site: "oldFunimation",
              location: pathname.groups!["location"],
            };
          }
        }
        break;
      case "animedigitalnetwork.fr":
      case "animationdigitalnetwork.fr":
        {
          let pathname = url.pathname.match(parseUrlAdn);
          if (pathname != null) {
            return {
              videoId: pathname.groups!["videoId"],
              site: "adn",
              location: "fr",
            };
          }
        }
        break;
      case SERVER_JOIN_URL:
        return { site: "awp" };
    }
    return null;
  }

  parseUrlTab(tab: browser.Tabs.Tab): Promise<{
    videoId?: string;
    site: SupportedSite | "awp";
    location?: string;
  } | null> {
    const url = tab?.url;
    if (url != null) {
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
          if (url2 == null) {
            resolve(null);
            return;
          }
          resolve(this.parseUrl(url2));
        })
        .catch((error) => {
          console.error(...this.saveError(error));
          resolve(null);
        });
    });
  }

  askUrl(
    tab: browser.Tabs.Tab,
    tabId: number
  ): Promise<string | null | undefined> {
    return new Promise((resolve) => {
      let backgroundUtils = this;
      if (tab.status === "complete") {
        action();
        return;
      }
      const waitTabToComplete = setInterval(() => {
        browser.tabs.get(tabId).then((tab) => {
          if (tab.status !== "complete") {
            return;
          }
          clearInterval(waitTabToComplete);
          action();
        });
      }, 100);
      function action() {
        browser.webNavigation
          .getAllFrames({ tabId: tabId })
          .then((details) => {
            for (const detail of details) {
              const url = new URL(detail.url);
              if (
                url.host === "www.crunchyroll.com" &&
                url.pathname.endsWith("/affiliate_iframeplayer")
              ) {
                let media_id = url.searchParams.get("media_id");
                if (media_id != null) {
                  backgroundUtils
                    .crunchyrollMediaIdToEtpGuid(media_id)
                    .then((etp_guid) =>
                      resolve(`https://www.crunchyroll.com/watch/${etp_guid}`)
                    )
                    .catch((error) => {
                      console.error(...backgroundUtils.saveError(error));
                      resolve(null);
                    });
                  return;
                }
              } else if (
                url.host === "www.crunchyroll.com" &&
                detail.frameId === 0
              ) {
                let pathname = url.pathname.match(parseUrlCrunchyroll);
                if (pathname != null) {
                  backgroundUtils
                    .crunchyrollMediaIdToEtpGuid(pathname!.groups!["media_id"])
                    .then((etp_guid) =>
                      resolve(`https://www.crunchyroll.com/watch/${etp_guid}`)
                    )
                    .catch((error) => {
                      console.error(...backgroundUtils.saveError(error));
                      resolve(null);
                    });
                  return;
                }
              } else if (
                url.host === "www.wakanim.tv" &&
                url.pathname.includes("/v2/catalogue/embeddedplayer/")
              ) {
                console.log(...backgroundUtils.saveLog("ask url", url));
                resolve(detail.url.replace("embeddedplayer", "episode"));
                return;
              }
            }
            resolve(null);
          })
          .catch((error) => {
            console.error(...backgroundUtils.saveError(error));
            resolve(null);
          });
      }
    });
  }

  crunchyrollMediaIdToEtpGuid(
    media_id: string
  ): Promise<string | null | undefined> {
    const crunchyUrl = this.urlFromCrunchyrollBetaToCrunchyroll.get(media_id);
    if (crunchyUrl != null) {
      return Promise.resolve(crunchyUrl);
    }

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
              const etp_guid = json.data.etp_guid;
              if (etp_guid != null) {
                this.urlFromCrunchyrollBetaToCrunchyroll.set(
                  media_id,
                  etp_guid
                );
              }
              return resolve(etp_guid);
            })
            .catch((error) => {
              console.error(...this.saveError(error));
              resolve(null);
            });
        })
        .catch((error) => {
          console.error(...this.saveError(error));
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
          console.error(...this.saveError(error));
          resolve(null);
        });
    });
  }

  changeIcon(): void {}

  getIcon(site: SupportedSite | null) {
    switch (site) {
      case "wakanim":
        return "/src/icons/wakanim.svg";
      case "crunchyroll":
        return "/src/icons/crunchyroll.svg";
      case "funimation":
      case "oldFunimation":
        return "/src/icons/funimation.svg";
      case "adn":
        return "/src/icons/adn.svg";
      default:
        return "/src/icons/activate.svg";
    }
  }

  insertScript(tab: browser.Tabs.Tab, tabId: number) {
    console.log(...this.saveLog("insert script"));

    browser.webNavigation
      .getAllFrames({ tabId: tabId })
      .then((details) => {
        for (const detail of details) {
          const url = new URL(detail.url);
          let site = this.parseUrl(detail.url)?.site;
          if (detail.frameId === 0) {
            browser.tabs
              .executeScript(tabId, {
                runAt: "document_start",
                file: "/src/content-scripts/tab/tab.bundle.js",
                frameId: detail.frameId,
              })
              .catch((error) => console.error(...this.saveError(error)));
          }
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
              .catch((error) => console.error(...this.saveError(error)));
          }
        }
      })
      .catch((error) => console.error(...this.saveError(error)));
  }

  convertUrl(
    url: {
      site: string;
      location?: string;
      videoId: string;
    },
    oldUrl:
      | {
          site: string;
          location?: string;
          videoId: string;
        }
      | undefined
  ): void {
    console.log(...this.saveLog("old url is", oldUrl));
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

  private saveLog(...logs: any[]) {
    return logs;
  }

  private saveError(...errors: any[]) {
    return errors;
  }
}
