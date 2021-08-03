exports.parseUrlWakanim =
  /^https:\/\/(?:www\.)?wakanim\.tv\/(?<location>\w+)\/v2\/\w+\/episode\/(?<videoId>\d+)/;
exports.parseUrlCrunchyroll =
  /^https:\/\/(?:www\.)?crunchyroll\.com\/(?:(?<location>[a-zA-Z]{2})\/)?(?<videoId>[\w-]+\/[\w-]+-\d+)\/?(?:\?.*)?$/;
