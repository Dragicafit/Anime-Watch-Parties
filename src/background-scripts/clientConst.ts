export const parseUrlWakanim =
  /^https:\/\/(?:www\.)?wakanim\.tv\/(?<location>[a-zA-Z]{2})\/v2\/\w+\/episode\/(?<videoId>\d+)/;
export const parseUrlCrunchyroll =
  /^https:\/\/(?:www\.)?crunchyroll\.com\/(?:(?<location>[a-zA-Z]{2})\/)?(?<videoId1>[\w-]+\/episode)[\w-]*(?<videoId2>-\d+)\/?(?:\?.*)?$/;
export const parseUrlFunimation =
  /^https:\/\/(?:www\.)?funimation\.com\/(?<location>[a-zA-Z]{2})\/shows\/(?<videoId>[\w-]+\/[\w-]+)\/?(?:\?.*)?$/;
export const parseUrlAdn =
  /^https:\/\/(?:www\.)?animedigitalnetwork\.fr\/video\/(?<videoId>[\w-]+\/\d+)/;
