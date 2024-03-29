import {
  eventsServerReceive,
  eventsServerSend,
  IoCallback,
  IoDebugSocket,
} from "./ioConst";
import { SocketContext } from "./ioContext";
import { IoUtils } from "./ioUtils";

const regexRoom = /^\w{1,30}$/;
const regexVideoId = /^[\w\/-]{1,300}$/;
const regexSite = /^(wakanim|crunchyroll|funimation|adn)$/;
const regexLocation = /^[a-zA-Z]{2}$/;

export default {
  start: function (socketContext: SocketContext, ioUtils: IoUtils) {
    socketContext.socket.on(
      eventsServerReceive.CHANGE_VIDEO_SERVER,
      (
        debugSocket: IoDebugSocket,
        roomnum: string,
        videoId: string,
        site: string,
        location: string | undefined,
        callback: IoCallback
      ) => {
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
        if (site === "crunchyroll" || site === "funimation") {
          location = undefined;
        } else {
          if (typeof location !== "string" || !regexLocation.test(location)) {
            debugSocket("location is not a valid string");
            return callback("wrong input");
          }
        }

        let ioRoom = ioUtils.getIoRoomIfIn(roomnum);
        if (ioRoom == null) {
          debugSocket("socket is not connected to room");
          return callback("access denied");
        }
        if (socketContext.socket.id !== ioRoom.host) {
          debugSocket("socket is not host");
          return callback("access denied");
        }
        debugSocket(`applied to room-${roomnum}`);

        ioRoom.updateVideo(videoId, site, location);
        socketContext.socket
          .to(`room-${roomnum}`)
          .emit(eventsServerSend.CHANGE_VIDEO_CLIENT, ioRoom.videoObject);

        callback(null, {});
      }
    );
  },
};
