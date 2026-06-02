export const PROD_SITE_URL = 'https://companii.faber.md' as const;
export const PROD_API_ORIGIN = 'https://api.companii.faber.md' as const;
export const PROD_API_URL = `${PROD_API_ORIGIN}/api/v1` as const;

export const DEV_SITE_URL = 'http://localhost:5174' as const;
export const DEV_API_ORIGIN = 'http://127.0.0.1:4100' as const;
export const DEV_API_URL = '/api/v1' as const;

export function inferApiUrlFromHostname(hostname: string): string | undefined {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEV_API_URL;
  }
  if (hostname === 'companii.faber.md') {
    return DEV_API_URL;
  }
  return undefined;
}
