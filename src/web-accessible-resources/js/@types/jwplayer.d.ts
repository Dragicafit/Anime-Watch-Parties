declare namespace jwplayer {
  interface PlayReason {
    playReason:
      | "autostart"
      | "external"
      | "interaction"
      | "playlist"
      | "related-auto"
      | "related-interaction"
      | "viewable";
  }

  interface PauseReason {
    pauseReason: "clickthrough" | "external" | "interaction";
  }

  interface EventParams {
    play: PlayParam & PlayReason;
    pause: PlayParam & PauseReason;
  }
}
