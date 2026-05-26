import {
  DEV_API_URL,
  inferApiUrlFromHostname,
  PROD_API_URL,
} from './urls';

export type AppEnv = {
  apiUrl: string;
  envName: string;
  useHttpOnly: boolean;
  isProd: boolean;
};

function pick(...vals: Array<string | undefined | null>): string | undefined {
  for (const v of vals) {
    const s = (v ?? '').toString().trim();
    if (s) return s;
  }
  return undefined;
}

// Vite: VITE_* at build time. Optional runtime override: window.__COMPANII_ENV__
const runtime = (() => {
  try {
    return window.__COMPANII_ENV__ as Partial<AppEnv> | undefined;
  } catch {
    return undefined;
  }
})();

const inferredApiUrl = (() => {
  try {
    return inferApiUrlFromHostname(window.location.hostname);
  } catch {
    return undefined;
  }
})();

const isProdBuild =
  import.meta.env.PROD || import.meta.env.VITE_ENV === 'production';

export const env: AppEnv = Object.freeze({
  apiUrl:
    pick(import.meta.env.VITE_API_URL, runtime?.apiUrl, inferredApiUrl) ??
    (isProdBuild ? PROD_API_URL : DEV_API_URL),
  envName:
    pick(import.meta.env.VITE_ENV, runtime?.envName) ??
    import.meta.env.MODE ??
    'development',
  isProd: isProdBuild,
  useHttpOnly: (() => {
    const explicit = import.meta.env.VITE_USE_HTTPONLY_COOKIE;
    if (explicit === 'true') return true;
    if (explicit === 'false') return false;
    if (runtime?.useHttpOnly !== undefined) return runtime.useHttpOnly;
    return isProdBuild;
  })(),
});
