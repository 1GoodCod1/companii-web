import { ChatIcon, PhoneIcon, EnvelopeIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import type { PublicCompanyDetailDto } from '@/entities/company/model/companies.types';

interface CompanyContactSidebarProps {
  company: PublicCompanyDetailDto;
}

export function CompanyContactSidebar({ company }: CompanyContactSidebarProps) {
  const { t } = useTranslation();
  const hasPublicContact = !!(company.contactPhone || company.contactEmail);

  return (
    <div className="glass-panel rounded-[28px] p-6 border border-white/40 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ChatIcon className="size-5 text-violet-600" />
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
          {t('companyDetail.contactTitle')}
        </h3>
      </div>

      {hasPublicContact ? (
        <div className="flex flex-col gap-3">
          {company.contactPhone ? (
            <a
              href={`tel:${company.contactPhone.replace(/\s/g, '')}`}
              className="group flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider transition-colors"
            >
              <PhoneIcon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
              {t('companyDetail.callCompany')}
            </a>
          ) : null}

          {company.contactEmail ? (
            <a
              href={`mailto:${company.contactEmail}`}
              className="group flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm"
            >
              <EnvelopeIcon className="size-4 shrink-0 text-slate-400 group-hover:text-violet-600 transition-colors" />
              {t('companyDetail.sendEmail')}
            </a>
          ) : null}

          {/* Settings status indicator (subtle hint) */}
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium text-center">
            <ShieldCheckIcon className="size-3 text-emerald-500 shrink-0" />
            {t('companyDetail.officialChannels')}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed text-wrap:pretty">
            {t('companyDetail.contactHidden')}
          </p>
          <p className="text-[11px] text-slate-400 leading-normal text-wrap:pretty">
            {t('companyDetail.contactHiddenHint')}
          </p>
        </div>
      )}
    </div>
  );
}
