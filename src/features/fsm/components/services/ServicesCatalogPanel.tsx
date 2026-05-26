import {
  EmptyState,
  SoftBadge,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CompanyServiceDto } from '@/types/fsm';
import { formatServiceDuration } from '@/utils/serviceDuration';

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
  if (isLoading) {
    return <p className="text-sm text-gray-400 p-4">Se încarcă...</p>;
  }

  if (!services?.length) {
    return (
      <EmptyState
        message="Niciun serviciu în catalog."
        action={
          <button type="button" onClick={onCreate} className="text-violet-600 font-semibold text-xs">
            Adaugă primul serviciu
          </button>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {services.map((service) => {
        const durationLabel = formatServiceDuration(service.durationMinutes);
        return (
          <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900">{service.name}</p>
                {service.isPublished ? (
                  <SoftBadge tone="emerald">Public</SoftBadge>
                ) : (
                  <SoftBadge tone="gray">Draft</SoftBadge>
                )}
              </div>
              {service.description ? (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
              ) : null}
              <p className="text-sm text-violet-700 font-bold mt-1">
                {Number(service.defaultPrice).toLocaleString('ro-MD')} {service.currency ?? 'MDL'}
                {durationLabel ? ` · ${durationLabel}` : ''}
                {service.category?.name ? ` · ${service.category.name}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(service)} className={cabinetBtnSecondary}>
                Editează
              </button>
              <button type="button" onClick={() => onDelete(service.id)} className={cabinetBtnSecondary}>
                Șterge
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
