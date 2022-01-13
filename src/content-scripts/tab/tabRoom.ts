export class TabRoom {
  roomnum: string | undefined;
  host: boolean | undefined;
  onlineUsers: number | undefined;
  messages: { sender: string; message: string }[];
  delay: number;

  constructor() {
    this.messages = [];
    this.delay = 0;
  }
}
