import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloppyDiskIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';
import { isOpenLeadStatus } from '@/entities/fsm/model/leadStatus';
import {
  leadAccentButtonClass,
  leadFieldInputClass,
  leadHighlightCardClass,
  leadSectionTitleClass,
} from '../leadPanelUi';

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

  if (isEditingNotes) {
    return (
      <div className={`space-y-2 ${leadHighlightCardClass}`}>
        <p className={leadSectionTitleClass}>
          {t('company.fsm.leads.inbox.notesLabel', 'Note / Link rezervare / Master')}
        </p>
        <textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          placeholder={t(
            'company.fsm.leads.inbox.notesPlaceholder',
            'Adăugați link rezervare / master / detalii...',
          )}
          aria-label={t(
            'company.fsm.leads.inbox.notesPlaceholder',
            'Adăugați link rezervare / master / detalii...',
          )}
          className={`${leadFieldInputClass} resize-none`}
          rows={2}
          disabled={savingNotes}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setTempNotes(lead.notes || '');
              setIsEditingNotes(false);
            }}
            disabled={savingNotes}
            className="inline-flex cursor-pointer items-center gap-1 border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-500"
          >
            <XIcon className="size-3.5" /> {t('cabinet.common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className={`${leadAccentButtonClass} px-3 py-1.5 text-[11px]`}
          >
            <FloppyDiskIcon className="size-3.5" /> {t('cabinet.common.save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start justify-between gap-3 ${leadHighlightCardClass}`}>
      <div className="min-w-0">
        <p className={leadSectionTitleClass}>
          {t('company.fsm.leads.inbox.notesLabel', 'Note / Link rezervare / Master')}
        </p>
        {lead.notes ? (
          /^https?:\/\//i.test(lead.notes) ? (
            <a
              href={lead.notes}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block break-all text-xs font-semibold text-[var(--dashboard-accent)] hover:underline"
            >
              {lead.notes}
            </a>
          ) : (
            <p className="mt-1.5 text-xs leading-relaxed text-gray-700">{lead.notes}</p>
          )
        ) : (
          <p className="mt-1.5 text-xs italic text-gray-400">
            {t('company.fsm.leads.inbox.noNotes', 'Nu sunt note. Adăugați link de rezervare sau master.')}
          </p>
        )}
      </div>
      {isOpenLeadStatus(lead.status) ? (
        <button
          type="button"
          onClick={() => setIsEditingNotes(true)}
          className="shrink-0 cursor-pointer border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:border-[var(--dashboard-accent)]/30 hover:text-[var(--dashboard-accent)]"
          title={t('company.fsm.leads.inbox.editNotes', 'Editează note')}
        >
          <PencilSimpleIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
