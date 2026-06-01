import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicPageHeader } from '@/components/public/PublicPageHeader';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useFaqSections } from '@/hooks/useFaqSections';

function faqKey(sectionId: string, index: number) {
  return `${sectionId}-${index}`;
}

export function FaqPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const sections = useFaqSections();
  const [openKey, setOpenKey] = useState<string | null>(
    sections[0] ? faqKey(sections[0].id, 0) : null,
  );

  return (
    <>
      <SEOHead
        title={t('faqPage.seo.title')}
        description={t('faqPage.seo.description')}
        hreflang
      />

      <div className="max-w-4xl mx-auto py-10 space-y-10">
        <PublicPageHeader
          badge={t('faqPage.badge')}
          title={t('faqPage.title')}
          description={t('faqPage.subtitle')}
        />

        <nav
          aria-label={t('faqPage.navLabel')}
          className="flex flex-wrap justify-center gap-2"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#faq-${section.id}`}
              className="border border-gray-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={`faq-${section.id}`} className="scroll-mt-24 space-y-4">
              <div className="space-y-1 px-1">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">{section.title}</h2>
                <p className="text-xs text-gray-500 font-medium">{section.description}</p>
              </div>

              <div className="space-y-3">
                {section.items.map((faq, idx) => {
                  const key = faqKey(section.id, idx);
                  const isOpen = openKey === key;

                  return (
                    <div
                      key={key}
                      className="bg-white border border-gray-100 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        className="w-full text-left p-5 flex justify-between items-start gap-4 font-black text-gray-800 text-sm tracking-tight cursor-pointer hover:bg-violet-50/10 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <span
                          className={`shrink-0 text-xs text-violet-500 transition-transform duration-300 mt-0.5 ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        >
                          ▼
                        </span>
                      </button>
                      <div
                        className={`transition-all duration-500 ease-out overflow-hidden ${
                          isOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="p-5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="border border-gray-100 rounded-3xl p-8 glass-panel text-center space-y-3">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            {t('faqPage.footerCta.title')}
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
            {t('faqPage.footerCta.description')}
          </p>
          <Link
            to={lp('/contacts')}
            className="inline-block mt-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            {t('faqPage.footerCta.button')}
          </Link>
        </section>
      </div>
    </>
  );
}
