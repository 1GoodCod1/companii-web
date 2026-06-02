import { Navigate, useParams } from 'react-router-dom';
import { PUBLIC_ROUTE } from '@/shared/constants/routes.constants';

export function RedirectLegacySubscriptionsPath() {
  const { locale } = useParams<{ locale: string }>();
  return <Navigate to={`/${locale ?? 'ro'}/${PUBLIC_ROUTE.SUBSCRIPTIONS}`} replace />;
}
