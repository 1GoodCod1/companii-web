import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, ClipboardList, MapPin, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHero, Panel, SoftBadge, EmptyState } from '@/components/cabinet/cabinet-ui';
import { PlanEditor2D } from '@/features/estimates/components/PlanEditor2D';
import { useWorksheetByInterventionQuery } from '@/features/estimates/api/useEstimates';
import { useUpdateChecklistMutation } from '@/features/fsm/api/useFsm';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';

export function EstimateWorkSheetPage() {
  const { id: interventionId } = useParams();
  const { isManagement } = useCompanyPermissions();
  const { data: sheet, isLoading, isError } = useWorksheetByInterventionQuery(interventionId ?? '', !!interventionId);
  const updateChecklist = useUpdateChecklistMutation(interventionId ?? '');

  const serverProgress = sheet?.intervention?.checklistProgress ?? {};
  const [pendingProgress, setPendingProgress] = useState<Record<string, boolean> | null>(null);
  const checklistProgress = pendingProgress ?? serverProgress;

  const handleToggleChecklist = async (key: string, checked: boolean) => {
    const next = { ...serverProgress, ...pendingProgress, [key]: checked };
    setPendingProgress(next);
    try {
      await updateChecklist.mutateAsync(next);
      setPendingProgress(null);
    } catch (err: unknown) {
      setPendingProgress(null);
      toast.error((err as Error).message || 'Nu s-a putut salva progresul.');
    }
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-gray-400">Se încarcă fișa de lucru...</p>;
  }

  if (isError || !sheet || !interventionId) {
    return (
      <EmptyState
        message="Această lucrare nu are smetă asociată sau nu aveți acces."
        action={
          <Link to="/company/lucrari" className="text-violet-600 font-semibold">
            Înapoi la lucrări
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/company/lucrari" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-600">
        <ArrowLeft className="w-4 h-4" /> Înapoi la lucrări
      </Link>

      <PageHero
        title="Fișă de execuție"
        description={
          isManagement
            ? 'Vizualizare completă pentru coordonare — tehnicianul vede aceeași structură fără prețuri.'
            : 'Plan, etape și materiale — fără informații comerciale.'
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lucrare</p>
          {sheet.intervention && (
            <>
              <p className="font-black text-gray-900">{sheet.intervention.number}</p>
              <p className="text-sm text-gray-600">{sheet.intervention.type}</p>
              <SoftBadge tone="violet">{sheet.intervention.status}</SoftBadge>
            </>
          )}
        </Panel>
        <Panel className="p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Client</p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User className="w-4 h-4 text-gray-400" /> {sheet.customer?.fullName}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" /> {sheet.customer?.phone}
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /> {sheet.intervention?.address ?? sheet.customer?.address}
          </div>
        </Panel>
        <Panel className="p-5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Smetă</p>
          <p className="font-bold text-gray-900">{sheet.project.title}</p>
          <p className="text-xs text-gray-500">{sheet.project.number} · {sheet.project.category.name}</p>
        </Panel>
      </div>

      {sheet.sitePlan?.plan2d && (
        <PlanEditor2D
          value={sheet.sitePlan.plan2d}
          readOnly={true}
          onChange={() => {}}
          categoryName={sheet.project.category.name}
          categorySlug={sheet.project.category.slug}
        />
      )}

      <div className="space-y-4">
        {sheet.stages.map((stage, index) => (
          <Panel key={stage.id} className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <div>
                <h3 className="font-bold text-gray-900">{stage.name}</h3>
                {stage.description && <p className="text-sm text-gray-500 mt-1">{stage.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                  {stage.laborHours != null && <span>~{stage.laborHours} ore</span>}
                  {stage.durationDays != null && <span>{stage.durationDays} zile</span>}
                </div>
              </div>
            </div>

            {stage.checklist?.length ? (
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Checklist
                </p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {stage.checklist.map((item) => {
                    const key = `${stage.id}:${item}`;
                    const checked = !!checklistProgress[key];
                    return (
                      <li key={key}>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-violet-50/40 transition-colors">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            disabled={updateChecklist.isPending}
                            onChange={(e) => handleToggleChecklist(key, e.target.checked)}
                          />
                          {checked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span className={checked ? 'line-through text-gray-400' : ''}>{item}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {stage.materials.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Materiale</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400">
                        <th className="pb-2">Descriere</th>
                        <th className="pb-2">Cantitate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stage.materials.map((mat) => (
                        <tr key={`${stage.id}-${mat.description}-${mat.qty}`}>
                          <td className="py-2 text-gray-800">{mat.description}</td>
                          <td className="py-2 font-semibold text-gray-900">{mat.qty} {mat.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
