export {};

declare global {
  interface Window {
    __COMPANII_ENV__?: Partial<{
      apiUrl: string;
      envName: string;
      useHttpOnly: boolean;
    }>;
  }
}
