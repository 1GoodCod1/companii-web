import { useEffect, useState, type ReactNode } from 'react';
import { bootstrapAuthSession } from '@/features/auth/api/useAuth';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void bootstrapAuthSession().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground bg-slate-950">
        Loading…
      </div>
    );
  }

  return children;
}
