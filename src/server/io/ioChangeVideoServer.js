const { Server: ioServer, Socket } = require("socket.io");

const regexVideoId = /^[\w\/-]{1,300}$/;
const regexSite = /^(wakanim|crunchyroll)$/;
const regexLocation = /^[a-zA-Z]{2}$/;

module.exports = {
  /** @param {ioServer} io @param {Socket} socket */
  start: function (io, socket) {
    socket.on(
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

        if (socket.roomnum == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        let room = io.sockets.adapter.rooms.get(`room-${socket.roomnum}`);
        if (room == null) {
          debugSocket("room is null (error server)");
          return callback("error server");
        }
        if (socket.id !== room.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${socket.roomnum}`);

        room.currVideo = videoId;
        room.site = site;
        room.location = location;
        socket.broadcast
          .to(`room-${socket.roomnum}`)
          .emit("changeVideoClient", {
            videoId: room.currVideo,
            site: room.site,
            location: room.location,
          });
      }
    );
  },
};
