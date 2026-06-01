export const SITE_URL = (
  process.env.SEO_SITE_URL || 'https://companii.faber.md'
).replace(/\/+$/, '');

export const API_URL = (
  process.env.SEO_API_URL ||
  process.env.VITE_API_URL ||
  'http://127.0.0.1:4100'
).replace(/\/+$/, '');

export const API_PREFIX = process.env.SEO_API_PREFIX || '/api/v1';

export const SEO_LOCALES = ['ro', 'ru'];

const BASE_STATIC_PATHS = [
  '/',
  '/companii',
  '/companies',
  '/how-it-works',
  '/faq',
  '/contacts',
  '/privacy',
  '/terms',
  '/preturi',
];

export const STATIC_ROUTES = SEO_LOCALES.flatMap((locale) =>
  BASE_STATIC_PATHS.map((path) => (path === '/' ? `/${locale}` : `/${locale}${path}`)),
);

export const SEO_URL_KINDS = ['companies', 'categories', 'landings'];
export const SITEMAP_CHUNK_SIZE = 45_000;
export const SEO_API_PAGE_LIMIT = 500;
