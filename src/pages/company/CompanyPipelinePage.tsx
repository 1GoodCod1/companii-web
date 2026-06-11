import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { KanbanBoard } from '@/features/fsm/components/pipeline/KanbanBoard';
import { PIPELINE_TABS } from '@/features/fsm/components/pipeline/pipelineMeta';
import type { PipelineEntity } from '@/features/fsm/components/pipeline/pipeline.types';

export function CompanyPipelinePage() {
  const { t } = useTranslation();
  const [activeEntity, setActiveEntity] = useState<PipelineEntity>('leads');

  return (
    <div className="space-y-5 animate-fade-in">
      <div
        className="scrollbar-none flex items-center gap-5 overflow-x-auto border-b border-gray-200"
        role="tablist"
      >
        {PIPELINE_TABS.map((tab) => {
          const isActive = tab.key === activeEntity;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveEntity(tab.key)}
              className={cn(
                '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-bold transition-colors',
                isActive
                  ? 'border-violet-600 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
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
