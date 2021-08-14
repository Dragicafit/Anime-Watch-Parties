export interface AwpPlayerInterface {
  onPlay(): void;

  onPause(): void;

  onSeek(): void;

  getTime(): void;

  isPlay(): void;

  seekTo(time: number): void;

  setState(state: boolean): void;

  playerExist(): void;
}
