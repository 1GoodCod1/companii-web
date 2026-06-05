import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import type { AdminBlueprintDto } from '@/features/admin/api/useAdmin';

interface AdminBlueprintCardProps {
  bp: AdminBlueprintDto;
  onEdit: (bp: AdminBlueprintDto) => void;
  onDelete: (bp: AdminBlueprintDto) => void;
  onToggleActive: (bp: AdminBlueprintDto) => void;
}

export function AdminBlueprintCard({
  bp,
  onEdit,
  onDelete,
  onToggleActive,
}: AdminBlueprintCardProps) {
  const { t } = useTranslation();
  const projectsCount = bp._count?.projects ?? 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Visual Glassmorphism Category Badge */}
      <div className="absolute top-0 right-0 p-3">
        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase bg-primary/10 text-primary border border-primary/10">
          {bp.category.name}
        </span>
      </div>

      <div className="space-y-4">
        <div className="pr-20">
          <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-1">
            {bp.name}
          </h3>
          <p className="text-[11px] text-gray-400 font-medium font-mono">
            Category Slug: <span className="text-gray-600">{bp.category.slug}</span>
          </p>
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              {t('admin.blueprintsPage.colVersion')}
            </span>
            <p className="font-semibold text-gray-700">v{bp.version}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              {t('admin.blueprintsPage.colUsage')}
            </span>
            <p className="font-semibold text-gray-700">{projectsCount} расчет. стоимости</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Footer actions with visual status switch */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <span className="sr-only">
                {t('admin.blueprintsPage.toggleActive', {
                  defaultValue: 'Comută starea activă a blueprintului',
                })}
              </span>
              <input
                type="checkbox"
                checked={bp.isActive}
                onChange={() => void onToggleActive(bp)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:size-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <span className={`text-[10px] font-black uppercase tracking-wider ${bp.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
              {bp.isActive ? 'Active' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(bp)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
            >
              <PencilSimpleIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => void onDelete(bp)}
              disabled={projectsCount > 0}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
