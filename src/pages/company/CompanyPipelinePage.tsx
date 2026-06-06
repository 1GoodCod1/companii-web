import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHero } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { KanbanBoard } from '@/features/fsm/components/pipeline/KanbanBoard';
import { PIPELINE_TABS } from '@/features/fsm/components/pipeline/pipelineMeta';
import type { PipelineEntity } from '@/features/fsm/components/pipeline/pipeline.types';

export function CompanyPipelinePage() {
  const { t } = useTranslation();
  const [activeEntity, setActiveEntity] = useState<PipelineEntity>('leads');

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow={t('company.fsm.pipeline.eyebrow')}
        title={t('company.fsm.pipeline.title')}
        description={t('company.fsm.pipeline.subtitle')}
      />

      <div className="flex flex-wrap gap-2">
        {PIPELINE_TABS.map((tab) => {
          const isActive = tab.key === activeEntity;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveEntity(tab.key)}
              className={cn(
                'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      <KanbanBoard key={activeEntity} entity={activeEntity} />
    </div>
  );
}
