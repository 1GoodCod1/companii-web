import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { env } from '@/config/env';

const WEB_VITALS_URL = (() => {
  const base = env.apiUrl.replace(/\/api(\/v\d+)?\/?$/, '');
  return `${base}/api/v1/web-vitals`;
})();

function sendMetric(metric: Metric): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });
  void fetch(WEB_VITALS_URL, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    /* fire-and-forget — never block the user on telemetry */
  });
}

export function reportWebVitals(): void {
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
}
