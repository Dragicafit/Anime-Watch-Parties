declare namespace VILOS_PLAYERJS {
  function on(event: string, callback: (event?: any) => void, ctx?: any): void;

  function getCurrentTime(callback: (value: number) => void): void;

  function getPaused(callback: (value: boolean) => void): void;

  function setCurrentTime(time: number): void;

  function play(): void;

  function pause(): void;
}
