import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FAQ_SECTIONS } from '@/components/public/faqContent';

function faqKey(sectionId: string, index: number) {
  return `${sectionId}-${index}`;
}

export function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>(faqKey(FAQ_SECTIONS[0]!.id, 0));

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-black uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full shadow-xs">
          Centrul de ajutor
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Întrebări Frecvente
        </h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
          Răspunsuri structurate pe domenii: platformă, companii, clienți, lucrări, cont și
          securitate.
        </p>
      </div>

      <nav
        aria-label="Categorii FAQ"
        className="flex flex-wrap justify-center gap-2"
      >
        {FAQ_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#faq-${section.id}`}
            className="rounded-full border border-gray-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 transition-colors"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {FAQ_SECTIONS.map((section) => (
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
                    className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-premium overflow-hidden transition-all duration-300"
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
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[480px] border-t border-gray-50' : 'max-h-0'
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

      <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-indigo-50/40 p-6 text-center space-y-3">
        <p className="text-sm font-bold text-gray-900">Nu găsiți răspunsul?</p>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Echipa noastră vă poate ajuta cu configurarea companiei, portalul clienților sau
          abonamentele.
        </p>
        <Link
          to="/contacts"
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-violet-700 transition-colors"
        >
          Contactează-ne
        </Link>
      </div>
    </div>
  );
}
