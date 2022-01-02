export class TabRoom {
  roomnum: string | undefined;
  host: boolean | undefined;
  delay: number;
  messages: { sender: string; message: string }[];

  constructor() {
    this.delay = 0;
    this.messages = [];
  }
}
