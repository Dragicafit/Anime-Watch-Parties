const { ClientContext } = require("./clientContext");
const { ClientRoom } = require("./clientRoom");

class ClientTab {
  /** @type {ClientContext} */
  clientContext;
  /** @type {String} */
  roomnum;
  /** @type {Boolean} */
  host;

  /** @param {ClientContext} clientContext */
  constructor(clientContext) {
    this.clientContext = clientContext;
  }

  get onlineUsers() {
    for (let [
      roomnum,
      clientRoom,
    ] of this.clientContext.clientRooms.entries()) {
      if (roomnum !== this.roomnum) continue;
      return clientRoom.onlineUsers;
    }
  }

  set onlineUsers(val) {
    for (let [
      roomnum,
      clientRoom,
    ] of this.clientContext.clientRooms.entries()) {
      if (roomnum !== this.roomnum) continue;
      clientRoom.onlineUsers = val;
      return;
    }
    let clientRoom2 = new ClientRoom();
    clientRoom2.onlineUsers = val;
    this.clientContext.clientRooms.set(this.roomnum, clientRoom2);
  }
}

exports.ClientTab = ClientTab;
