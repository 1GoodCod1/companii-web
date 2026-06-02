import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '@/shared/config/i18n/utils';
import { useLocale } from '@/shared/hooks/useLocale';
import { PROD_SITE_URL } from '@/shared/config/urls';
import {
  DEFAULT_LOCALE,
  LOCALES,
  getOgLocale,
  getOgLocaleAlternates,
  localizePath,
  stripLocalePrefix,
} from '@/lib/i18n/localeRoutes';

export const SITE_URL = PROD_SITE_URL;
const BASE_TITLE = 'Faber';
const DEFAULT_OG_IMAGE = '/og-image.png';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonical?: string;
  noindex?: boolean;
  hreflang?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noindex = false,
  hreflang = false,
}: SEOHeadProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useLocale();
  const resolvedDescription = description ?? t('seo.defaultDescription');
  const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
  const absoluteOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_URL}${ogImage}`;

  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const canonicalUrl =
    canonical ??
    `${SITE_URL}${localizePath(pathWithoutLocale, locale)}${location.search}`;

  const hreflangUrls = useMemo(() => {
    if (!hreflang) return null;
    const path = stripLocalePrefix(location.pathname);
    const search = location.search;
    const urls = {} as Record<AppLanguage, string>;
    for (const lng of LOCALES) {
      urls[lng] = `${SITE_URL}${localizePath(path, lng)}${search}`;
    }
    return urls;
  }, [hreflang, location]);

  const ogLocale = getOgLocale(locale);
  const ogLocaleAlternates = getOgLocaleAlternates(locale);

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta name="geo.region" content="MD" />
      <meta name="geo.placename" content="Moldova" />
      <meta name="ICBM" content="47.0, 29.0" />

      {hreflangUrls && (
        <>
          <link rel="alternate" hrefLang="x-default" href={hreflangUrls[DEFAULT_LOCALE]} />
          {LOCALES.map((lng) => (
            <link key={lng} rel="alternate" hrefLang={lng} href={hreflangUrls[lng]} />
          ))}
        </>
      )}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:site_name" content={BASE_TITLE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={ogLocale} />
      {ogLocaleAlternates.map((alt) => (
        <meta key={alt} property="og:locale:alternate" content={alt} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={absoluteOgImage} />

      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
