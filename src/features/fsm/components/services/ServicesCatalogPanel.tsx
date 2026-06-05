import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import {
  EmptyState,
  SkeletonList,
  SoftBadge,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyServiceDto } from '@/entities/fsm/model/types';
import { formatServiceDurationI18n } from '@/entities/fsm/model/serviceDuration';
import { useTranslation } from 'react-i18next';
import { getTranslatedCategoryName } from '@/shared/utils/translateCityCategory';

export function ServicesCatalogPanel({
  services,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
}: {
  services: CompanyServiceDto[] | undefined;
  isLoading: boolean;
  onEdit: (service: CompanyServiceDto) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <LoadingStatus label={t('cabinet.common.loading')} className="p-4">
        <SkeletonList rows={4} />
      </LoadingStatus>
    );
  }

  if (!services?.length) {
    return (
      <EmptyState
        message={t('company.fsm.services.catalog.empty')}
        action={
          <button type="button" onClick={onCreate} className="text-violet-600 font-semibold text-xs">
            {t('company.fsm.services.catalog.addFirst')}
          </button>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {services.map((service) => {
        const durationLabel = formatServiceDurationI18n(t, service.durationMinutes);
        return (
          <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900">{service.name}</p>
                {service.isPublished ? (
                  <SoftBadge tone="emerald">{t('company.fsm.services.catalog.badges.published')}</SoftBadge>
                ) : (
                  <SoftBadge tone="gray">{t('company.fsm.services.catalog.badges.draft')}</SoftBadge>
                )}
              </div>
              {service.description ? (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
              ) : null}
              <p className="text-sm text-violet-700 font-bold mt-1">
                {Number(service.defaultPrice).toLocaleString('ro-MD')} {service.currency ?? 'MDL'}
                {durationLabel ? ` · ${durationLabel}` : ''}
                {service.category
                  ? ` · ${getTranslatedCategoryName(t, service.category)}`
                  : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(service)} className={cabinetBtnSecondary}>
                {t('cabinet.common.edit')}
              </button>
              <button type="button" onClick={() => onDelete(service.id)} className={cabinetBtnSecondary}>
                {t('cabinet.common.delete')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
