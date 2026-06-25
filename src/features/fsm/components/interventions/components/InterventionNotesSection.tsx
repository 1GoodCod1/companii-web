import { useTranslation } from 'react-i18next';
import { useLocale } from '@/shared/hooks/useLocale';
import { formatDateLocalized } from '@/shared/utils/date';
import type { InterventionNoteDto } from '@/entities/fsm/model/types';
import {
  interventionAccentButtonClass,
  interventionFieldInputClass,
  interventionSectionTitleClass,
} from '../interventionPanelUi';

interface InterventionNotesSectionProps {
  notes: InterventionNoteDto[] | undefined;
  noteBody: string;
  setNoteBody: (v: string) => void;
  handleAddNote: (e: React.FormEvent) => Promise<void>;
  handleDeleteNote: (id: string) => void;
  canDeleteNote: (n: InterventionNoteDto) => boolean;
}

export function InterventionNotesSection({
  notes,
  noteBody,
  setNoteBody,
  handleAddNote,
  handleDeleteNote,
  canDeleteNote,
}: InterventionNotesSectionProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <div className="space-y-4 border-t border-[var(--dashboard-divider)] pt-5">
      <h4 className={interventionSectionTitleClass}>
        {t('company.fsm.interventions.detail.notes.title', { count: notes?.length || 0 })}
      </h4>

      <form onSubmit={(e) => void handleAddNote(e)} className="flex gap-2">
        <input
          type="text"
          required
          placeholder={t('company.fsm.interventions.detail.notes.placeholder')}
          aria-label={t('company.fsm.interventions.detail.notes.placeholder')}
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          className={`${interventionFieldInputClass} flex-1 text-xs`}
        />
        <button type="submit" className={interventionAccentButtonClass}>
          {t('cabinet.common.send')}
        </button>
      </form>

      {notes?.length ? (
        <div className="max-h-52 divide-y divide-[var(--dashboard-divider)] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="group py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold text-[var(--dashboard-accent)]">
                  {note.author?.fullName || note.author?.user?.email}
                </span>
                {canDeleteNote(note) ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="cursor-pointer text-[10px] font-bold uppercase tracking-wide text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    {t('cabinet.common.delete')}
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {note.body}
              </p>
              <span className="mt-1.5 block text-right text-[10px] font-medium text-gray-400">
                {formatDateLocalized(note.createdAt, locale)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
