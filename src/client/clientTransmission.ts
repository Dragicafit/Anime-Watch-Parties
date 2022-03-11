import { eventsServerSend } from "../server/io/ioConst";
import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";

export default {
  start: function (clientContext: ClientContext, clientEvent: ClientEvent) {
    clientContext.socket.on(eventsServerSend.CHANGE_STATE_CLIENT, (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeStateClient(clientRoom, data.time, data.state);
    });
    clientContext.socket.on(eventsServerSend.GET_USERS, (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeOnlineUsersClient(clientRoom, data.onlineUsers);
    });
    clientContext.socket.on(eventsServerSend.UNSET_HOST, (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeHostClient(clientRoom, false);
    });
    clientContext.socket.on(eventsServerSend.CHANGE_VIDEO_CLIENT, (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeVideoClient(clientRoom, {
        site: data.site,
        location: data.location,
        videoId: data.videoId,
      });
    });
    clientContext.socket.on(eventsServerSend.CREATE_MESSAGE_CLIENT, (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.createMessageClient(clientRoom, data.sender, data.message);
    });
  },
};
