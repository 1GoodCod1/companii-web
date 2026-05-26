import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { PROD_SITE_URL } from '@/config/urls';

export const SITE_URL = PROD_SITE_URL;
const BASE_TITLE = 'Faber Companii';
const DEFAULT_DESCRIPTION =
  'Faber Companii — platforma de gestionare a companiilor de servicii din Moldova: clienți, intervenții, oferte, smete, facturi.';
const DEFAULT_OG_IMAGE = '/og-image.png';
const SITE_LOCALE = 'ro_MD';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonical?: string;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOHeadProps) {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
  const absoluteOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_URL}${ogImage}`;
  const canonicalUrl =
    canonical ?? `${SITE_URL}${location.pathname}${location.search}`;

  return (
    <Helmet>
      <html lang="ro" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta name="geo.region" content="MD" />
      <meta name="geo.placename" content="Moldova" />
      <meta name="ICBM" content="47.0, 29.0" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:site_name" content={BASE_TITLE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={SITE_LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />

      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
