export type AppEnv = {
  apiUrl: string;
  envName: string;
  useHttpOnly: boolean;
};

function pick(...vals: Array<string | undefined | null>): string | undefined {
  for (const v of vals) {
    const s = (v ?? '').toString().trim();
    if (s) return s;
  }
  return undefined;
}

export const env: AppEnv = Object.freeze({
  apiUrl:
    pick(import.meta.env.VITE_API_URL) ??
    (import.meta.env.DEV ? '/api/v1' : 'https://api.companii.faber.md/api/v1'),
  envName: pick(import.meta.env.VITE_ENV) ?? import.meta.env.MODE ?? 'development',
  useHttpOnly: (() => {
    const explicit = import.meta.env.VITE_USE_HTTPONLY_COOKIE;
    if (explicit === 'true') return true;
    if (explicit === 'false') return false;
    return import.meta.env.PROD;
  })(),
});
