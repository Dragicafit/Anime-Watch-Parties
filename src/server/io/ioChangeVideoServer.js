const Room = require("./room");
const Utils = require("./utils");

const regexVideoId = /^[\w\/-]{1,300}$/;
const regexSite = /^(wakanim|crunchyroll)$/;
const regexLocation = /^[a-zA-Z]{2}$/;

module.exports = {
  /** @param {Utils} utils */
  start: function (utils) {
    utils.socket.on(
      "changeVideoServer",
      (debugSocket, videoId, site, location, callback) => {
        if (typeof videoId !== "string" || !regexVideoId.test(videoId)) {
          debugSocket("videoId is not a valid string");
          return callback("wrong input");
        }
        if (typeof site !== "string" || !regexSite.test(site)) {
          debugSocket("site is not a valid string");
          return callback("wrong input");
        }
        if (typeof location !== "string" || !regexLocation.test(location)) {
          debugSocket("location is not a valid string");
          return callback("wrong input");
        }

        let room = utils.getRoom();
        if (room == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (utils.socket.id !== room.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${utils.roomnum}`);

        room.currVideo = videoId;
        room.site = site;
        room.location = location;
        utils.socket.broadcast
          .to(`room-${utils.roomnum}`)
          .emit("changeVideoClient", {
            videoId: room.currVideo,
            site: room.site,
            location: room.location,
          });
      }
    );
  },
};
