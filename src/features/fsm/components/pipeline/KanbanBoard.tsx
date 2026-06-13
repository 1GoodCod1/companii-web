import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errors';
import { queryKeys } from '@/shared/api/queryKeys';
import { EmptyState, InlineSpinner, SkeletonCard } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import { usePipelineBoardQuery, fetchPipelineColumn } from '../../api/usePipelineBoard';
import { KanbanCard } from './KanbanCard';
import { usePipelineActions } from './usePipelineActions';
import { allowedTargets, columnLabel, columnTone, readOnlyHintKey } from './pipelineMeta';
import type { BoardCard, BoardColumn, KanbanTone, PipelineEntity } from './pipeline.types';

const DOT: Record<KanbanTone, string> = {
  violet: 'bg-violet-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  blue: 'bg-blue-400',
  gray: 'bg-slate-300',
  red: 'bg-rose-400',
  indigo: 'bg-indigo-400',
};

const COUNT_BADGE: Record<KanbanTone, string> = {
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-slate-200 text-slate-600',
  red: 'bg-rose-100 text-rose-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

interface DragState {
  cardId: string;
  from: string;
  targets: string[];
}

type ColumnExtra = { cards: BoardCard[]; nextCursor: string | null };

export function KanbanBoard({ entity }: { entity: PipelineEntity }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = usePipelineBoardQuery(entity);
  const { move } = usePipelineActions();
  const { ask, dialog } = useCabinetConfirmDialog();

  const [drag, setDrag] = useState<DragState | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [loadingColumn, setLoadingColumn] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, ColumnExtra>>({});

  const readOnlyHint = readOnlyHintKey(entity);

  const columns: BoardColumn[] = useMemo(
    () =>
      (data?.columns ?? []).map((col) => {
        const ex = extra[col.status];
        return ex
          ? { ...col, cards: [...col.cards, ...ex.cards], nextCursor: ex.nextCursor }
          : col;
      }),
    [data?.columns, extra],
  );

  async function performMove(card: BoardCard, toStatus: string) {
    setMovingId(card.id);
    try {
      await move(entity, card, toStatus);
      setExtra({});
      await qc.invalidateQueries({ queryKey: queryKeys.fsm.pipelineBoard(entity) });
      toast.success(t('company.fsm.pipeline.moved'));
    } catch (err) {
      toast.error(getErrorMessage(err, t('company.fsm.pipeline.moveError')));
    } finally {
      setMovingId(null);
    }
  }

  function handleDrop(toStatus: string) {
    const active = drag;
    setOverColumn(null);
    setDrag(null);
    if (!active || active.from === toStatus || !active.targets.includes(toStatus)) return;

    const card = columns
      .find((c) => c.status === active.from)
      ?.cards.find((c) => c.id === active.cardId);
    if (!card) return;
    const isDestructive =
      (entity === 'leads' && toStatus === LEAD_STATUS.LOST) ||
      (entity === 'interventions' && toStatus === INTERVENTION_STATUS.CANCELLED);

    if (isDestructive) {
      ask({
        title: t('cabinet.common.confirmAction'),
        confirmLabel: t('cabinet.common.confirmAction'),
        variant: 'danger',
        message: t(
          'company.fsm.pipeline.confirmDestructiveMove',
          'Această acțiune închide definitiv elementul. Continuați?',
        ),
        onConfirm: () => performMove(card, toStatus),
      });
      return;
    }

    void performMove(card, toStatus);
  }

  async function handleLoadMore(status: string, cursor: string) {
    setLoadingColumn(status);
    try {
      const page = await fetchPipelineColumn(entity, status, cursor);
      setExtra((prev) => ({
        ...prev,
        [status]: {
          cards: [...(prev[status]?.cards ?? []), ...page.cards],
          nextCursor: page.nextCursor,
        },
      }));
    } catch (err) {
      toast.error(getErrorMessage(err, t('company.fsm.pipeline.moveError')));
    } finally {
      setLoadingColumn(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 pb-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  const totalCount = columns.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-3">
      {readOnlyHint ? <p className="text-xs font-medium text-amber-600">{t(readOnlyHint)}</p> : null}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-start gap-4 pb-3">
        {columns.map((column) => {
          const tone = columnTone(entity, column.status);
          const isValidTarget = !!drag && drag.targets.includes(column.status);
          const isDimmed = !!drag && !isValidTarget && drag.from !== column.status;
          const remaining = Math.max(column.total - column.cards.length, 0);

          return (
            <section
              key={column.status}
              onDragOver={(e) => {
                if (!isValidTarget) return;
                e.preventDefault();
                setOverColumn(column.status);
              }}
              onDragLeave={() => setOverColumn((cur) => (cur === column.status ? null : cur))}
              onDrop={() => void handleDrop(column.status)}
              className={cn(
                'flex flex-col rounded-2xl bg-slate-100/70 transition',
                isValidTarget && 'ring-2 ring-violet-300',
                overColumn === column.status && isValidTarget && 'bg-violet-50/80',
                isDimmed && 'opacity-50',
              )}
            >
              <header className="flex items-center justify-between gap-2 px-3.5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn('size-2 shrink-0 rounded-full', DOT[tone])} />
                  <span className="truncate text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {columnLabel(entity, column.status, t)}
                  </span>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                    COUNT_BADGE[tone],
                  )}
                >
                  {column.total}
                </span>
              </header>

              <div className="flex min-h-[120px] flex-1 flex-col gap-2 px-2.5 pb-2.5">
                {column.cards.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl py-6 text-[11px] font-medium text-gray-400/70">
                    {t('company.fsm.pipeline.emptyColumn')}
                  </div>
                ) : (
                  column.cards.map((card) => {
                    const targets = allowedTargets(entity, card.status);
                    return (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        tone={tone}
                        draggable={targets.length > 0}
                        isMoving={movingId === card.id}
                        onDragStart={() => setDrag({ cardId: card.id, from: card.status, targets })}
                        onDragEnd={() => {
                          setDrag(null);
                          setOverColumn(null);
                        }}
                      />
                    );
                  })
                )}

                {column.nextCursor ? (
                  <button
                    type="button"
                    onClick={() => void handleLoadMore(column.status, column.nextCursor!)}
                    disabled={loadingColumn === column.status}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {loadingColumn === column.status ? (
                      <InlineSpinner size={13} />
                    ) : (
                      t('company.fsm.pipeline.loadMore', { count: remaining })
                    )}
                  </button>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {totalCount === 0 ? (
        <EmptyState message={t('company.fsm.pipeline.emptyPipeline')} compact />
      ) : null}
      {dialog}
    </div>
  );
}
