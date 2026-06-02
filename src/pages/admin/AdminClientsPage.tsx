import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useAdminClientsQuery,
  useUpdateAdminClientMutation,
  type AdminClientDto,
} from '@/features/admin';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatPersonName } from '@/shared/utils/person';

export function AdminClientsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: clients, isLoading } = useAdminClientsQuery();
  const updateClient = useUpdateAdminClientMutation();

  const handleToggleActive = async (client: AdminClientDto) => {
    try {
      await updateClient.mutateAsync({ id: client.id, isActive: !client.isActive });
      toast.success(
        client.isActive ? t('admin.clientsPage.toastDeactivated') : t('admin.clientsPage.toastActivated'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('admin.clientsPage.eyebrow')}
        title={t('admin.clientsPage.title')}
        description={t('admin.clientsPage.description')}
      />

      <Panel>
        <PanelHeader
          title={t('admin.clientsPage.listTitle')}
          description={t('admin.clientsPage.listDescription')}
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">{t('cabinet.common.loading')}</p>
        ) : !clients?.length ? (
          <EmptyState message={t('admin.clientsPage.empty')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">{t('admin.clientsPage.colClient')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.clientsPage.colContact')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.clientsPage.colCompany')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.clientsPage.colStatus')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.clientsPage.colActions')}</th>
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
                        {formatDateLocalized(client.createdAt, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{client.email}</p>
                      {client.phone ? <p className="text-xs text-gray-400 mt-0.5">{client.phone}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.portalCustomer?.company?.name ?? (
                        <span className="text-gray-400">{t('admin.clientsPage.unlinked')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SoftBadge tone={client.isActive ? 'emerald' : 'gray'}>
                        {client.isActive ? t('admin.clientsPage.active') : t('admin.clientsPage.inactive')}
                      </SoftBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(client)}
                        disabled={updateClient.isPending}
                        className={cabinetBtnSecondary}
                      >
                        {client.isActive ? t('cabinet.common.deactivate') : t('cabinet.common.activate')}
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
