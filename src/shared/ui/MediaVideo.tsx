import { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';

type MediaVideoProps = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  src: string | null | undefined;
  lazy?: boolean;
  fallbackClassName?: string;
};

export const MediaVideo = forwardRef<HTMLVideoElement, MediaVideoProps>(function MediaVideo(
  {
    src,
    className,
    lazy = false,
    fallbackClassName,
    preload,
    ...props
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const resolved = resolveMediaUrl(src);

  useEffect(() => {
    if (!lazy || isVisible || !containerRef.current) return;

    const node = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, isVisible]);

  if (!resolved) {
    if (fallbackClassName) {
      return <div className={cn(fallbackClassName, className)} aria-hidden />;
    }
    return null;
  }

  if (lazy && !isVisible) {
    return (
      <div
        ref={containerRef}
        className={cn(fallbackClassName ?? 'bg-slate-200', className)}
        aria-hidden
      />
    );
  }

  return (
    <video
      {...props}
      ref={ref}
      src={resolved}
      className={className}
      preload={preload ?? 'metadata'}
    />
  );
});
