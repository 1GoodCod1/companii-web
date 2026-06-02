import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';
import type { CrewDto } from '@/features/fsm/api/useCrews';
import type { AssignMode } from '../hooks/useCreateInterventionForm';
import { memberDisplayName } from '@/entities/company/model/teamMembers';

interface AssignmentSectionProps {
  assignMode: AssignMode;
  setAssignMode: (mode: AssignMode) => void;
  technicianId: string;
  setTechnicianId: (id: string) => void;
  memberIds: string[];
  toggleMember: (id: string) => void;
  crewId: string;
  setCrewId: (id: string) => void;
  techniciansSorted: CompanyMemberDto[];
  activeCrews: CrewDto[];
}

export function AssignmentSection({
  assignMode,
  setAssignMode,
  technicianId,
  setTechnicianId,
  memberIds,
  toggleMember,
  crewId,
  setCrewId,
  techniciansSorted,
  activeCrews,
}: AssignmentSectionProps) {
  const { t } = useTranslation();

  const technicianOptions = useMemo(
    () => [
      {
        value: '',
        label: t('company.fsm.interventions.createModal.fields.technicianPlaceholder'),
      },
      ...techniciansSorted.map((m) => ({
        value: m.id,
        label: memberDisplayName(m),
      })),
    ],
    [techniciansSorted, t],
  );

  const crewOptions = useMemo(
    () => [
      {
        value: '',
        label: t('company.fsm.interventions.createModal.assignMode.crewPlaceholder', {
          defaultValue: 'Alege o brigadă...',
        }),
      },
      ...activeCrews.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.members.length})`,
      })),
    ],
    [activeCrews, t],
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
          {t('company.fsm.interventions.createModal.fields.assignmentMode', {
            defaultValue: 'Atribuire',
          })}
        </span>
        {(['single', 'multiple', 'crew'] as AssignMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAssignMode(mode)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
              assignMode === mode
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-violet-50'
            }`}
          >
            {t(`company.fsm.interventions.createModal.assignMode.${mode}`, {
              defaultValue:
                mode === 'single' ? 'Un singur' : mode === 'multiple' ? 'Mai mulți' : 'Brigadă',
            })}
          </button>
        ))}
      </div>

      {assignMode === 'single' && (
        <AppSelect
          value={technicianId}
          onChange={setTechnicianId}
          options={technicianOptions}
          aria-label={t('company.fsm.interventions.createModal.fields.technicianPlaceholder')}
        />
      )}

      {assignMode === 'multiple' && (
        <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
          {techniciansSorted.length === 0 ? (
            <p className="text-xs text-gray-400 italic p-2">
              {t('company.fsm.interventions.createModal.assignMode.noMembers', {
                defaultValue: 'Niciun membru disponibil',
              })}
            </p>
          ) : (
            techniciansSorted.map((m, idx) => (
              <label
                key={m.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-violet-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={memberIds.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="size-3.5 accent-violet-600"
                />
                <span className="font-medium text-gray-800">{memberDisplayName(m)}</span>
                {memberIds.indexOf(m.id) === 0 && memberIds.length > 1 && (
                  <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
                    {t('company.fsm.interventions.createModal.assignMode.lead', {
                      defaultValue: 'Lead',
                    })}
                  </span>
                )}
                {memberIds.length === 1 && memberIds[0] === m.id && (
                  <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
                    {t('company.fsm.interventions.createModal.assignMode.lead', { defaultValue: 'Lead' })}
                  </span>
                )}
                <span className="sr-only">{idx}</span>
              </label>
            ))
          )}
        </div>
      )}

      {assignMode === 'crew' && (
        <div className="space-y-2">
          <AppSelect
            value={crewId}
            onChange={setCrewId}
            options={crewOptions}
            aria-label={t('company.fsm.interventions.createModal.assignMode.crewPlaceholder', {
              defaultValue: 'Alege o brigadă...',
            })}
          />
          {(() => {
            const chosen = activeCrews.find((c) => c.id === crewId);
            if (!chosen) return null;
            return (
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {chosen.members
                  .map((mm) => mm.member.fullName || '—')
                  .join(', ')}
              </p>
            );
          })()}
          {activeCrews.length === 0 && (
            <p className="text-[10px] text-amber-700 italic">
              {t('company.fsm.interventions.createModal.assignMode.noCrews', {
                defaultValue:
                  'Nu există brigăzi configurate. Creează o brigadă în pagina „Brigăzi”.',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
