import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Save, X } from 'lucide-react';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';
import { isOpenLeadStatus } from '@/entities/fsm/model/leadStatus';

interface LeadNotesEditorProps {
  lead: CompanyLeadDto;
  onNotesChange?: (lead: CompanyLeadDto, notes: string | null) => Promise<void>;
}

export function LeadNotesEditor({ lead, onNotesChange }: LeadNotesEditorProps) {
  const { t } = useTranslation();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(lead.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    if (!onNotesChange) return;
    setSavingNotes(true);
    try {
      await onNotesChange(lead, tempNotes.trim() || null);
      setIsEditingNotes(false);
    } catch {
      // ignore error
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="max-w-2xl pt-1">
      {isEditingNotes ? (
        <div className="rounded-xl bg-violet-50/40 border border-violet-100 p-3 space-y-2">
          <textarea
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            placeholder={t('company.fsm.leads.inbox.notesPlaceholder', 'Adăugați link rezervare / master / detalii...')}
            aria-label={t('company.fsm.leads.inbox.notesPlaceholder', 'Adăugați link rezervare / master / detalii...')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
            rows={2}
            disabled={savingNotes}
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setTempNotes(lead.notes || '');
                setIsEditingNotes(false);
              }}
              disabled={savingNotes}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-500 bg-white hover:bg-gray-50"
            >
              <X className="size-3.5" /> {t('cabinet.common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Save className="size-3.5" /> {t('cabinet.common.save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-violet-50/30 border border-violet-100/50 p-3.5 text-xs text-violet-950 leading-relaxed flex items-start justify-between gap-4 font-medium hover:border-violet-200/80 transition-all">
          <div className="min-w-0">
            <span className="font-extrabold text-violet-900 block text-[10px] uppercase tracking-wider mb-1">
              📌 {t('company.fsm.leads.inbox.notesLabel', 'Note / Link rezervare / Master')}
            </span>
            {lead.notes ? (
              /^https?:\/\//i.test(lead.notes) ? (
                <a
                  href={lead.notes}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-700 hover:underline font-bold break-all"
                >
                  {lead.notes}
                </a>
              ) : (
                <span className="text-slate-700">{lead.notes}</span>
              )
            ) : (
              <span className="text-violet-600/80 italic">
                {t('company.fsm.leads.inbox.noNotes', 'Nu sunt note. Adăugați link de rezervare sau master.')}
              </span>
            )}
          </div>
          {isOpenLeadStatus(lead.status) && (
            <button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              className="rounded-lg bg-white border border-gray-200 p-1.5 text-violet-600 hover:bg-violet-50 transition-colors shadow-2xs cursor-pointer shrink-0"
              title={t('company.fsm.leads.inbox.editNotes', 'Editează note')}
            >
              <Edit2 className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
