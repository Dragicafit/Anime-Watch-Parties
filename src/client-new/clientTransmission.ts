import { eventsServerSend } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";

export default {
  start: function (clientContext: ClientContext, clientEvent: ClientEvent) {
    clientContext.socket.on(eventsServerSend.CHANGE_STATE_CLIENT, (data) => {
      if (
        clientContext.clientRoom == null ||
        clientContext.clientRoom?.roomnum !== data.roomnum
      ) {
        return;
      }

      clientEvent.changeStateClient(
        clientContext.clientRoom,
        data.time,
        data.state
      );
    });
    clientContext.socket.on(eventsServerSend.GET_USERS, (data) => {
      if (
        clientContext.clientRoom == null ||
        clientContext.clientRoom?.roomnum !== data.roomnum
      ) {
        return;
      }

      clientEvent.changeOnlineUsersClient(
        clientContext.clientRoom,
        data.onlineUsers
      );
    });
    clientContext.socket.on(eventsServerSend.UNSET_HOST, (data) => {
      if (
        clientContext.clientRoom == null ||
        clientContext.clientRoom?.roomnum !== data.roomnum
      ) {
        return;
      }

      clientEvent.changeHostClient(clientContext.clientRoom, false);
    });
    clientContext.socket.on(eventsServerSend.CHANGE_VIDEO_CLIENT, (data) => {
      if (
        clientContext.clientRoom == null ||
        clientContext.clientRoom?.roomnum !== data.roomnum
      ) {
        return;
      }

      clientEvent.changeVideoClient(clientContext.clientRoom, {
        site: data.site,
        location: data.location,
        videoId: data.videoId,
      });
    });
    clientContext.socket.on(eventsServerSend.CREATE_MESSAGE_CLIENT, (data) => {
      if (
        clientContext.clientRoom == null ||
        clientContext.clientRoom?.roomnum !== data.roomnum
      ) {
        return;
      }

      clientEvent.createMessageClient(
        clientContext.clientRoom,
        data.sender,
        data.message
      );
    });
  },
};
