import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type LegalTocItem = {
  id: string;
  label: string;
};

type LegalDocumentLayoutProps = {
  badge: string;
  title: string;
  updatedAt: string;
  updatedAtPrefix?: string;
  intro?: string;
  toc?: LegalTocItem[];
  tocTitle?: string;
  tocAriaLabel?: string;
  relatedLink?: { href: string; label: string };
  children: ReactNode;
};

export function LegalDocumentLayout({
  badge,
  title,
  updatedAt,
  updatedAtPrefix = 'Ultima actualizare:',
  intro,
  toc,
  tocTitle = 'Cuprins',
  tocAriaLabel = 'Cuprins document',
  relatedLink,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <article className="legal-document max-w-3xl mx-auto py-10 space-y-8 animate-fade-in">
      <header className="space-y-4">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
          {badge}
        </span>
        <div className="space-y-2">
          <h1 className="legal-title text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
            {title}
          </h1>
          <p className="legal-meta text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            {updatedAtPrefix} {updatedAt}
          </p>
        </div>
        {intro ? (
          <p className="legal-lead text-base md:text-[1.05rem] text-gray-600 leading-relaxed max-w-2xl">
            {intro}
          </p>
        ) : null}
      </header>

      {toc && toc.length > 0 ? (
        <nav
          aria-label={tocAriaLabel}
          className="legal-toc rounded-2xl border border-gray-100 p-5 md:p-6 glass-panel"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {tocTitle}
          </p>
          <ol className="grid gap-2 sm:grid-cols-2">
            {toc.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-start gap-2 text-sm text-gray-600 hover:text-violet-700 transition-colors"
                >
                  <span className="mt-0.5 text-[11px] font-bold tabular-nums text-violet-500/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug group-hover:underline underline-offset-2">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="legal-document-body rounded-3xl border border-gray-100 p-6 md:p-8 glass-panel space-y-8">
        {children}
      </div>

      {relatedLink ? (
        <footer className="text-center">
          <Link
            to={relatedLink.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            {relatedLink.label}
            <span aria-hidden="true">→</span>
          </Link>
        </footer>
      ) : null}
    </article>
  );
}

type LegalSectionProps = {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
  className?: string;
};

export function LegalSection({ id, number, title, children, className }: LegalSectionProps) {
  return (
    <section id={id} className={cn('legal-section scroll-mt-28 space-y-3', className)}>
      <h2 className="legal-section-title text-sm md:text-[0.95rem] font-bold uppercase tracking-[0.12em] text-gray-900">
        {number}. {title}
      </h2>
      <div className="legal-section-content space-y-3">{children}</div>
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="legal-paragraph">{children}</p>;
}

export function LegalList({ items }: { items: Array<{ label?: string; text: string }> }) {
  return (
    <ul className="legal-list list-disc pl-5 space-y-2">
      {items.map((item, index) => (
        <li key={`${item.label ?? 'item'}-${index}`}>
          {item.label ? <strong className="text-gray-800">{item.label}</strong> : null}
          {item.label ? ' ' : null}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export function LegalSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-subsection space-y-2 pl-0 md:pl-1">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
