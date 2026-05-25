import { Link } from 'react-router-dom';
import { Calculator, ChevronRight, Plus, Sparkles } from 'lucide-react';
import {
  PageHero,
  Panel,
  EmptyState,
  cabinetBtnPrimary,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useEstimateProjectsQuery } from '@/features/estimates/api/useEstimates';
import {
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_TONES,
} from '@/features/estimates/statusLabels';

export function CompanyEstimatesPage() {
  const { data: projects, isLoading } = useEstimateProjectsQuery();

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title="Smete inteligente"
          description="Proiecte de deviz pe categorii — plan 2D/3D, etape, calcul automat și deviz pentru client."
          action={
            <Link to="/company/smete/new" className={cabinetBtnPrimary}>
              <Plus className="w-4 h-4" />
              Smetă nouă
            </Link>
          }
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Panel className="p-5 bg-gradient-to-br from-violet-50 to-white border-violet-100">
            <Sparkles className="w-5 h-5 text-violet-600 mb-2" />
            <p className="font-bold text-gray-900">Pe categorii</p>
            <p className="text-sm text-gray-500 mt-1">Fiecare tip de lucrare are propriul șablon, etape și formule.</p>
          </Panel>
          <Panel className="p-5 bg-gradient-to-br from-sky-50 to-white border-sky-100">
            <Calculator className="w-5 h-5 text-sky-600 mb-2" />
            <p className="font-bold text-gray-900">Calcul automat</p>
            <p className="text-sm text-gray-500 mt-1">Din plan, diagnostic și norme — manoperă + materiale + marjă.</p>
          </Panel>
          <Panel className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <ChevronRight className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="font-bold text-gray-900">Până la execuție</p>
            <p className="text-sm text-gray-500 mt-1">Generați deviz, convertiți în lucrări, trimiteți fișa tehnicianului.</p>
          </Panel>
        </div>

        <Panel>
          {isLoading ? (
            <p className="p-6 text-sm text-gray-400">Se încarcă smetele...</p>
          ) : !projects?.length ? (
            <EmptyState
              message="Nicio smetă încă. Creați prima smetă inteligentă — alegeți categoria și urmați wizard-ul."
              action={
                <Link to="/company/smete/new" className={cabinetBtnPrimary}>
                  <Plus className="w-4 h-4" />
                  Smetă nouă
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Nr / titlu</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Categorie</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-violet-50/30">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{project.number}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{project.title}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{project.customer.fullName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {project.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <SoftBadge tone={ESTIMATE_STATUS_TONES[project.status] ?? 'gray'}>
                          {ESTIMATE_STATUS_LABELS[project.status] ?? project.status}
                        </SoftBadge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {Number(project.grandTotal).toLocaleString('ro-MD')} MDL
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/company/smete/${project.id}`}
                          className="inline-flex items-center gap-1 text-violet-600 font-semibold hover:text-violet-700"
                        >
                          Deschide <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </CompanyManagementGate>
  );
}
