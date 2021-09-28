export const parseUrlWakanim =
  /^https:\/\/www\.wakanim\.tv\/(?<location>[a-zA-Z]{2})\/v2\/\w+\/episode\/(?<videoId>\d+)/;
export const parseUrlCrunchyroll =
  /^https:\/\/www\.crunchyroll\.com\/(?:(?<location>[a-zA-Z]{2})\/)?(?<serie_name>[\w-]+)\/episode[\w-]*-(?<media_id>\d+)/;
export const parseUrlNewCrunchyroll =
  /^\/(?:(?<location>[a-zA-Z]{2})\/)?watch\/(?<etp_guid>[A-Z0-9]+)/;
export const parseUrlSerieCrunchyroll =
  /^https:\/\/beta\.crunchyroll\.com\/series\/(?<serie_etp_guid>[A-Z0-9]+)/;
export const parseUrlFunimation =
  /^https:\/\/www\.funimation\.com\/(?<location>[a-zA-Z]{2})\/shows\/(?<videoId>[\w-]+\/[\w-]+)/;
export const parseUrlNewFunimation =
  /^https:\/\/www\.funimation\.com\/v\/(?<videoId>[\w-]+\/[\w-]+)/;
export const parseUrlAdn =
  /^https:\/\/animedigitalnetwork\.fr\/video\/(?<videoId>[\w-]+\/\d+)/;
