class popup {
  constructor() {
    window.addEventListener("message", this.handlePopoutMessage);
    this.popup = window.open(
      `${server}auth/twitch`,
      "Twitch",
      "width=1024,height=600,scrollbars=yes"
    );
    if (!this.popup) return;
    let interval = setInterval(function () {
      if (this.popup.closed || this.popup.success || this.popup.error) {
        end(this.popup.success);
        clearInterval(interval);
      }
    }, 500);

    socket.close();
  }
  handlePopoutMessage(e) {
    if (e.origin !== window.location.origin) return;
    if ("authenticationSuccess" !== e.data?.messageType) return;
    if (!this.popup) return;

    this.end();
  }
  end(success = true) {
    window.removeEventListener("message", this.handlePopoutMessage);
    this.popup.close();
    this.popup = undefined;

    if (success) socket.connect();
  }
}
