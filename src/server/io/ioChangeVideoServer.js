const { IoContext } = require("./ioContext");
const { IoUtils } = require("./ioUtils");

const regexRoom = /^\w{1,30}$/;
const regexVideoId = /^[\w\/-]{1,300}$/;
const regexSite = /^(wakanim|crunchyroll)$/;
const regexLocation = /^[a-zA-Z]{2}$/;

module.exports = {
  /** @param {IoContext} ioContext @param {IoUtils} ioUtils */
  start: function (ioContext, ioUtils) {
    ioContext.socket.on(
      "changeVideoServer",
      (debugSocket, roomnum, videoId, site, location, callback) => {
        if (typeof roomnum !== "string" || !regexRoom.test(roomnum)) {
          debugSocket("roomnum is not a valid string");
          return callback("wrong input");
        }
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

        let ioRoom = ioUtils.getIoRoomIfIn(roomnum);
        if (ioRoom == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (ioContext.socket.id !== ioRoom.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${roomnum}`);

        ioRoom.updateVideo(videoId, site, location);
        ioContext.socket
          .to(`room-${roomnum}`)
          .emit("changeVideoClient", ioRoom.videoObject);
      }
    );
  },
};
