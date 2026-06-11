import { useTranslation } from 'react-i18next';
import { formatMdl } from '@/shared/utils/money';
import { InlineSpinner } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import type { BoardCard, KanbanTone } from './pipeline.types';

const ACCENT: Record<KanbanTone, string> = {
  violet: 'border-l-violet-400',
  emerald: 'border-l-emerald-400',
  amber: 'border-l-amber-400',
  blue: 'border-l-blue-400',
  gray: 'border-l-slate-300',
  red: 'border-l-rose-400',
  indigo: 'border-l-indigo-400',
};

export function KanbanCard({
  card,
  tone,
  draggable,
  isMoving,
  onDragStart,
  onDragEnd,
}: {
  card: BoardCard;
  tone: KanbanTone;
  draggable: boolean;
  isMoving: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <article
      draggable={draggable && !isMoving}
      onDragStart={(e) => {
        // Required for Firefox to initiate the drag.
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative min-h-[96px] rounded-xl border border-l-4 border-slate-200/70 bg-white p-4 shadow-sm transition',
        ACCENT[tone],
        draggable
          ? 'cursor-grab hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing'
          : 'cursor-default',
        isMoving && 'pointer-events-none opacity-50',
      )}
      title={draggable ? t('company.fsm.pipeline.dragHint') : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">{card.title}</p>
        {isMoving ? <InlineSpinner size={14} /> : null}
      </div>
      {card.subtitle ? (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{card.subtitle}</p>
      ) : null}
      {card.meta || (card.amount != null && card.amount > 0) ? (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          {card.meta ? (
            <span className="text-[11px] text-gray-400 line-clamp-1">{card.meta}</span>
          ) : (
            <span />
          )}
          {card.amount != null && card.amount > 0 ? (
            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-gray-700">
              {formatMdl(card.amount)}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
