export const parseUrlWakanim =
  /^\/(?<location>[a-zA-Z]{2})\/v2\/\w+\/episode\/(?<videoId>\d+)/;
export const parseUrlCrunchyroll =
  /^\/(?:(?<location>[a-zA-Z]{2})\/)?(?<serie_name>[\w-]+)\/episode[\w-]*-(?<media_id>\d+)/;
export const parseUrlNewCrunchyroll =
  /^\/(?:(?<location>[a-zA-Z]{2})\/)?watch\/(?<etp_guid>[A-Z0-9]+)/;
export const parseUrlSerieCrunchyroll =
  /^\/series\/(?<serie_etp_guid>[A-Z0-9]+)/;
export const parseUrlOldFunimation =
  /^\/(?<location>[a-zA-Z]{2})\/shows\/(?<videoId>[\w-]+\/[\w-]+)/;
export const parseUrlFunimation = /^\/v\/(?<videoId>[\w-]+\/[\w-]+)/; //
export const parseUrlAdn = /^\/video\/(?<videoId>[\w-]+\/\d+)/;
export const parseUrlAwp = /^\/(?<roomnum>[a-zA-Z0-9]{5})$/;
