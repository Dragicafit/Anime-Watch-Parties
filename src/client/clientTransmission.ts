import { ClientContext } from "./clientContext";
import { ClientEvent } from "./clientEvents";

export default {
  start: function (clientContext: ClientContext, clientEvent: ClientEvent) {
    clientContext.socket.on("changeStateClient", (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeStateClient(clientRoom, data.time, data.state);
    });
    clientContext.socket.on("getUsers", (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeOnlineUsersClient(clientRoom, data.onlineUsers);
    });
    clientContext.socket.on("unSetHost", (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeHostClient(clientRoom, false);
    });
    clientContext.socket.on("changeVideoClient", (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.changeVideoClient(clientRoom, {
        site: data.site,
        location: data.location,
        videoId: data.videoId,
      });
    });
    clientContext.socket.on("createMessageClient", (data) => {
      const clientRoom = clientContext.clientRooms.get(data.roomnum);
      if (clientRoom == null) return;

      clientEvent.createMessageClient(clientRoom, data.sender, data.message);
    });
  },
};
