export interface AwpPlayerInterface {
  onPlay(): void;

  onPause(): void;

  onSeek(): void;

  getTime(): Promise<number>;

  isPlay(): Promise<boolean>;

  seekTo(time: number): void;

  setState(state: boolean): void;

  playerExist(): boolean;
}
