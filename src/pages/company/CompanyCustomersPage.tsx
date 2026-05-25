import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useCustomerTimelineQuery,
} from '@/features/fsm/api/useFsm';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CustomerDto, CustomerTimelineItemDto } from '@/features/fsm/types';
import {
  buildPortalInviteUrl,
  useCreatePortalInviteMutation,
} from '@/features/companies/api/usePortalInvite';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { INTERVENTION_STATUS_LABELS } from '@/features/fsm/statusLabels';
import { ESTIMATE_STATUS_LABELS, ESTIMATE_STATUS_TONES } from '@/features/estimates/statusLabels';

function timelineHref(item: CustomerTimelineItemDto): string | null {
  const meta = item.meta ?? {};
  if (item.type === 'intervention' && typeof meta.interventionId === 'string') {
    return '/company/lucrari';
  }
  if (item.type === 'quote' && typeof meta.quoteId === 'string') {
    return '/company/oferte';
  }
  if (item.type === 'estimate' && typeof meta.estimateId === 'string') {
    return `/company/smete/${meta.estimateId}`;
  }
  if (item.type === 'invoice' && typeof meta.invoiceId === 'string') {
    return '/company/facturi';
  }
  return null;
}

function timelineStatusLabel(item: CustomerTimelineItemDto): string | undefined {
  if (!item.status) return undefined;
  if (item.type === 'intervention') {
    return INTERVENTION_STATUS_LABELS[item.status as keyof typeof INTERVENTION_STATUS_LABELS] ?? item.status;
  }
  if (item.type === 'estimate') {
    return ESTIMATE_STATUS_LABELS[item.status] ?? item.status;
  }
  return item.status;
}

function timelineStatusTone(item: CustomerTimelineItemDto): 'gray' | 'violet' | 'blue' | 'amber' | 'emerald' {
  if (item.type === 'estimate' && item.status) {
    return ESTIMATE_STATUS_TONES[item.status] ?? 'gray';
  }
  if (item.type === 'intervention') {
    if (item.status === 'COMPLETED' || item.status === 'PAID') return 'emerald';
    if (item.status === 'SCHEDULED' || item.status === 'IN_PROGRESS') return 'amber';
    return 'blue';
  }
  return 'violet';
}

export function CompanyCustomersPage() {
  const { data: customers, isLoading } = useCustomersQuery();
  const createCustomer = useCreateCustomerMutation();
  const updateCustomer = useUpdateCustomerMutation();
  const deleteCustomer = useDeleteCustomerMutation();
  const createPortalInvite = useCreatePortalInviteMutation();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [viewCustomer, setViewCustomer] = useState<CustomerDto | null>(null);
  const [portalInviteLink, setPortalInviteLink] = useState<{
    customerId: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const activePortalInviteLink =
    portalInviteLink && viewCustomer?.id === portalInviteLink.customerId
      ? portalInviteLink
      : null;

  const { data: timeline, isLoading: timelineLoading } = useCustomerTimelineQuery(
    viewCustomer?.id ?? '',
    !!viewCustomer,
  );

  const filtered = customers?.filter((c: CustomerDto) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (customer: CustomerDto) => {
    setEditingId(customer.id);
    setFullName(customer.fullName);
    setPhone(customer.phone);
    setEmail(customer.email || '');
    setAddress(customer.address);
    setNotes(customer.notes || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    try {
      if (editingId) {
        await updateCustomer.mutateAsync({
          id: editingId,
          fullName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
        });
        toast.success('Client actualizat cu succes!');
      } else {
        await createCustomer.mutateAsync({
          fullName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
        });
        toast.success('Client creat cu succes!');
      }
      handleCloseModal();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'A apărut o eroare.');
    }
  };

  const handlePortalInvite = async (customer: CustomerDto) => {
    try {
      const invite = await createPortalInvite.mutateAsync(customer.id);
      const inviteUrl = buildPortalInviteUrl(invite.token);
      setPortalInviteLink({
        customerId: customer.id,
        url: inviteUrl,
        expiresAt: invite.expiresAt,
      });
      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Link portal generat și copiat în clipboard.');
      } catch {
        toast.success('Link portal generat. Copiază manual din câmp.');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut genera invitația.');
    }
  };

  const handleCopyPortalLink = async () => {
    if (!activePortalInviteLink) return;
    try {
      await navigator.clipboard.writeText(activePortalInviteLink.url);
      toast.success('Link copiat în clipboard.');
    } catch {
      toast.error('Nu s-a putut copia linkul.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți acest client?')) return;
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success('Client șters cu succes!');
      if (viewCustomer?.id === id) setViewCustomer(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut șterge clientul. Verificați dacă are lucrări sau oferte active.');
    }
  };

  return (
    <CompanyManagementGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Clienți"
        description="Gestionează baza de date a clienților tăi, istoricul lucrărilor și detaliile de contact."
        action={
          <button type="button" onClick={handleOpenCreate} className={cabinetBtnPrimary}>
            + Adaugă client
          </button>
        }
      />

      <Panel className="p-4">
        <input
          type="text"
          placeholder="Caută după nume, telefon sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cabinetFieldClass}
        />
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Se încarcă clienții...</div>
          ) : filtered.length === 0 ? (
            <EmptyState message="Niciun client găsit." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="p-4 text-xs uppercase tracking-wider">Nume complet</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Telefon & Email</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Adresă</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setViewCustomer(c)}
                      className={`hover:bg-violet-50/20 transition-colors cursor-pointer ${
                        viewCustomer?.id === c.id ? 'bg-violet-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{c.fullName}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-gray-900 font-bold">{c.phone}</div>
                        {c.email && <div className="text-gray-400 mt-0.5">{c.email}</div>}
                      </td>
                      <td className="p-4 text-xs text-gray-500 max-w-xs truncate">{c.address}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 hover:bg-violet-50 rounded-xl text-gray-500 hover:text-violet-600 transition-colors cursor-pointer text-xs"
                            title="Editează"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-600 transition-colors cursor-pointer text-xs"
                            title="Șterge"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Detalii client" description="Selectează un client din listă." />
          {viewCustomer ? (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{viewCustomer.fullName}</p>
                <p className="text-[10px] text-gray-400 mt-1">ID: {viewCustomer.id}</p>
              </div>

              <div className="space-y-2.5 text-sm text-gray-700 bg-slate-50/80 p-4 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-400">📞</span>
                  <span className="font-bold text-gray-800">{viewCustomer.phone}</span>
                </div>
                {viewCustomer.email && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-gray-400">✉️</span>
                    <span className="font-medium text-gray-600">{viewCustomer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-400">📍</span>
                  <span className="text-gray-600 font-medium">{viewCustomer.address}</span>
                </div>
              </div>

              {viewCustomer.notes && (
                <div className="bg-violet-50/40 p-3.5 rounded-xl">
                  <p className="text-xs font-semibold text-violet-700 mb-1.5">Note interne</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{viewCustomer.notes}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Acces portal client</p>
                {viewCustomer.portalUserId ? (
                  <p className="text-sm font-semibold text-emerald-700">
                    Clientul are deja cont legat în portal.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Trimite linkul clientului sau lasă-l să se înregistreze cu același telefon/email.
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePortalInvite(viewCustomer)}
                      disabled={createPortalInvite.isPending}
                      className={cabinetBtnSecondary}
                    >
                      {createPortalInvite.isPending
                        ? 'Se generează...'
                        : activePortalInviteLink
                          ? 'Regenerează link portal'
                          : 'Generează link portal'}
                    </button>
                    {activePortalInviteLink && (
                      <div className="space-y-2">
                        <label className={cabinetLabelClass}>Link portal (valabil 2 ore)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={activePortalInviteLink.url}
                            className={`${cabinetFieldClass} text-xs font-mono`}
                            onFocus={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={handleCopyPortalLink}
                            className={`${cabinetBtnSecondary} shrink-0 px-3`}
                          >
                            Copiază
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Expiră la:{' '}
                          {new Date(activePortalInviteLink.expiresAt).toLocaleString('ro-MD', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                          . Linkurile vechi devin invalide la regenerare.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-2 text-xs text-gray-400">
                Înregistrat la:{' '}
                {viewCustomer.createdAt
                  ? new Date(viewCustomer.createdAt).toLocaleDateString('ro-MD')
                  : 'Nespecificat'}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Istoric client</p>
                {timelineLoading ? (
                  <p className="text-xs text-gray-400">Se încarcă istoricul...</p>
                ) : !timeline?.items.length ? (
                  <EmptyState message="Nicio activitate înregistrată." />
                ) : (
                  <ol className="relative border-l border-violet-100 ml-2 space-y-4">
                    {timeline.items.map((item: CustomerTimelineItemDto) => {
                      const href = timelineHref(item);
                      const statusLabel = timelineStatusLabel(item);
                      return (
                      <li key={item.id} className="ml-4">
                        <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-violet-400 ring-4 ring-white" />
                        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <SoftBadge tone="violet">{item.type}</SoftBadge>
                              {statusLabel ? (
                                <SoftBadge tone={timelineStatusTone(item)}>{statusLabel}</SoftBadge>
                              ) : null}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(item.at).toLocaleDateString('ro-MD', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {href ? (
                            <Link to={href} className="text-sm font-semibold text-violet-700 hover:text-violet-800">
                              {item.title}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          )}
                          {item.subtitle ? (
                            <p className="text-xs text-gray-500">{item.subtitle}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                    })}
                  </ol>
                )}
              </div>
            </div>
          ) : (
            <EmptyState message="Selectează un client din listă pentru a-i vedea profilul detaliat." />
          )}
        </Panel>
      </div>

      {/* Create / Edit Modal */}
      <AppModal
        open={showModal}
        onClose={handleCloseModal}
        title={editingId ? 'Editează Client' : 'Adaugă Client Nou'}
        size="lg"
        backgroundIndex={1}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cabinetLabelClass}>Nume complet *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ex: Ion Popescu"
                  className={cabinetFieldClass}
                />
              </div>

              <div>
                <label className={cabinetLabelClass}>
                  Telefon *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ex: +373 68 000 000"
                  className={cabinetFieldClass}
                />
              </div>

              <div>
            <label className={cabinetLabelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: ion@popescu.md"
                  className={cabinetFieldClass}
                />
              </div>

              <div>
                <label className={cabinetLabelClass}>
                  Adresă de livrare/lucru *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: str. Ștefan cel Mare 1, ap. 12, Chișinău"
                  className={cabinetFieldClass}
                />
              </div>

              <div>
                <label className={cabinetLabelClass}>Note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observații despre client (ex. cod interfon, ore preferate)..."
                  rows={3}
                  className={`${cabinetFieldClass} resize-none`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={handleCloseModal} className={cabinetBtnSecondary}>
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending || updateCustomer.isPending}
                  className={cabinetBtnPrimary}
                >
                  Salvează
                </button>
              </div>
            </form>
      </AppModal>
    </div>
    </CompanyManagementGate>
  );
}
