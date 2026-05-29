import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { formatDateLocalized } from '@/utils/date';
import type { InterventionNoteDto } from '@/types/fsm';

interface InterventionNotesSectionProps {
  notes: InterventionNoteDto[] | undefined;
  noteBody: string;
  setNoteBody: (v: string) => void;
  handleAddNote: (e: React.FormEvent) => Promise<void>;
  handleDeleteNote: (id: string) => Promise<void>;
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
    <div className="border-t border-gray-100 pt-4 space-y-3.5">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {t('company.fsm.interventions.detail.notes.title', { count: notes?.length || 0 })}
      </h4>
      <form onSubmit={(e) => void handleAddNote(e)} className="flex gap-2">
        <input
          type="text"
          required
          placeholder={t('company.fsm.interventions.detail.notes.placeholder')}
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          {t('cabinet.common.send')}
        </button>
      </form>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notes?.map((n) => (
          <div key={n.id} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 relative group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-violet-700">
                {n.author?.fullName || n.author?.user?.email}
              </span>
              {canDeleteNote(n) ? (
                <button
                  onClick={() => void handleDeleteNote(n.id)}
                  className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer font-bold uppercase"
                >
                  {t('cabinet.common.delete')}
                </button>
              ) : null}
            </div>
            <p className="text-xs text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed font-medium">{n.body}</p>
            <span className="text-[9px] text-gray-400 block text-right mt-1.5 font-bold uppercase tracking-wider">
              {formatDateLocalized(n.createdAt, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
