import { useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';

type MediaImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  fallbackClassName?: string;
};

export function MediaImage({
  src,
  alt = '',
  className,
  fallback,
  fallbackClassName,
  onError,
  ...props
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (!resolved || failed) {
    if (fallback) return <>{fallback}</>;
    if (fallbackClassName) {
      return <div className={cn(fallbackClassName, className)} aria-hidden />;
    }
    return null;
  }

  return (
    <img
      {...props}
      src={resolved}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
