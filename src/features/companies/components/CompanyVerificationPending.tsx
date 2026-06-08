import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Hourglass, Circle, Gear, User } from '@phosphor-icons/react';
import { InlineSpinner, Panel } from '@/widgets/cabinet/cabinet-ui';

interface CompanyVerificationPendingProps {
  companyName: string;
}

export function CompanyVerificationPending({ companyName }: CompanyVerificationPendingProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-8 animate-fade-in">
      {/* Premium Gradient Card Container */}
      <Panel className="p-8 border border-amber-100 bg-gradient-to-br from-amber-50/20 via-white to-amber-50/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl relative overflow-hidden">
        
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Pulsing Modern Icon Bracket */}
          <div className="relative flex items-center justify-center size-20 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 shadow-sm animate-pulse">
            <Hourglass className="size-10" weight="duotone" />
            <span className="absolute -top-1.5 -right-1.5 flex size-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-4 bg-amber-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {t('company.verificationPending.title', 'Кабинет на модерации')}
            </h1>
            <p className="text-xs font-semibold text-amber-700 tracking-wide bg-amber-50/80 border border-amber-100/50 px-3 py-1 rounded-full inline-block">
              {companyName}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
            {t(
              'company.verificationPending.description',
              'Ваша компания зарегистрирована и ожидает проверки администратором. Доступ к рабочим панелям будет открыт автоматически сразу после одобрения.'
            )}
          </p>

          {/* Progress / Step Indicator Checklist */}
          <div className="w-full max-w-md bg-white/60 backdrop-blur-sm border border-gray-100/80 rounded-2xl p-5 text-left space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {t('company.verificationPending.statusTitle', 'Статус проверки')}
            </h3>
            
            <div className="space-y-3">
              {/* Step 1: Registered */}
              <div className="flex items-center gap-3">
                <CheckCircle className="size-5 text-emerald-500 shrink-0" weight="fill" />
                <span className="text-xs font-semibold text-gray-700 line-through decoration-gray-300">
                  {t('company.verificationPending.stepRegistered', 'Регистрация компании')}
                </span>
              </div>
              
              {/* Step 2: Moderation (Active) */}
              <div className="flex items-center gap-3">
                <div className="size-5 flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="size-5 animate-spin-slow" weight="duotone" />
                </div>
                <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  {t('company.verificationPending.stepReview', 'Проверка администратором')}
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider scale-95">
                    {t('company.verificationPending.statusWaiting', 'Ожидает')}
                  </span>
                </span>
              </div>
              
              {/* Step 3: Locked Access */}
              <div className="flex items-center gap-3 opacity-40">
                <Circle className="size-5 text-gray-400 shrink-0" />
                <span className="text-xs font-medium text-gray-500">
                  {t('company.verificationPending.stepActivate', 'Активация кабинета')}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-update Banner Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100/60">
            <InlineSpinner size={12} />
            <span>{t('company.verificationPending.autoUpdateInfo', 'Страница обновится автоматически, не закрывайте её.')}</span>
          </div>

          {/* Action Links */}
          <div className="w-full pt-4 flex flex-col sm:flex-row gap-3 items-center justify-center border-t border-gray-100/60">
            <Link
              to="/company/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-gray-700 transition-colors shadow-sm"
            >
              <User className="size-4 text-gray-400" />
              {t('company.verificationPending.editProfile', 'Редактировать профиль')}
            </Link>
            
            <Link
              to="/company/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-gray-700 transition-colors shadow-sm"
            >
              <Gear className="size-4 text-gray-400" />
              {t('company.verificationPending.settings', 'Настройки')}
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
