import toast from 'react-hot-toast';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  useAdminClientsQuery,
  useUpdateAdminClientMutation,
  type AdminClientDto,
} from '@/features/admin/api/useAdmin';
import { formatDateRo } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { formatPersonName } from '@/utils/person';

export function AdminClientsPage() {
  const { data: clients, isLoading } = useAdminClientsQuery();
  const updateClient = useUpdateAdminClientMutation();

  const handleToggleActive = async (client: AdminClientDto) => {
    try {
      await updateClient.mutateAsync({ id: client.id, isActive: !client.isActive });
      toast.success(client.isActive ? 'Contul a fost dezactivat.' : 'Contul a fost activat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Operația a eșuat.'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Utilizatori"
        title="Clienți portal"
        description="Conturi END_CLIENT înregistrate pe platformă și legătura cu companiile."
      />

      <Panel>
        <PanelHeader
          title="Lista clienților"
          description="Clienții se leagă de companiile prin telefon, email sau invitație portal."
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Se încarcă...</p>
        ) : !clients?.length ? (
          <EmptyState message="Nu există clienți înregistrați." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Companie legată</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {formatPersonName(
                          {
                            firstName: client.firstName,
                            lastName: client.lastName,
                            fullName: client.portalCustomer?.fullName,
                            email: client.email,
                          },
                          client.email,
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateRo(client.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{client.email}</p>
                      {client.phone ? <p className="text-xs text-gray-400 mt-0.5">{client.phone}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.portalCustomer?.company?.name ?? (
                        <span className="text-gray-400">Nelinkat</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SoftBadge tone={client.isActive ? 'emerald' : 'gray'}>
                        {client.isActive ? 'Activ' : 'Inactiv'}
                      </SoftBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(client)}
                        disabled={updateClient.isPending}
                        className={cabinetBtnSecondary}
                      >
                        {client.isActive ? 'Dezactivează' : 'Activează'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
