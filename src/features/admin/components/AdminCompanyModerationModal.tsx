import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/components/cabinet/cabinet-ui';
import {
  useAdminAuditQuery,
  useAdminCompanyQuery,
  useRejectCompanyMutation,
  useUnpublishCompanyMutation,
  useVerifyCompanyMutation,
  type AdminAuditLogDto,
  type AdminCompanyDto,
} from '@/features/admin/api/useAdmin';

function formatUserName(user?: AdminAuditLogDto['user']) {
  if (!user) return 'Sistem';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email;
}

function auditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    COMPANY_VERIFIED: 'Companie verificată',
    COMPANY_REJECTED: 'Companie respinsă',
    COMPANY_UNPUBLISHED: 'Publicare retrasă',
    COMPANY_PUBLISHED: 'Companie publicată',
    SUBSCRIPTION_CHANGED: 'Plan abonament schimbat',
    REVIEW_MODERATED: 'Recenzie moderată',
    COMPANY_CREATED: 'Companie creată',
  };
  return labels[action] ?? action;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 break-words">{value || '—'}</p>
    </div>
  );
}

function CompanyModerationContent({
  company,
  note,
  setNote,
  onClose,
}: {
  company: AdminCompanyDto;
  note: string;
  setNote: (value: string) => void;
  onClose: () => void;
}) {
  const verifyCompany = useVerifyCompanyMutation();
  const rejectCompany = useRejectCompanyMutation();
  const unpublishCompany = useUnpublishCompanyMutation();
  const { data: auditLogs, isLoading: auditLoading } = useAdminAuditQuery({
    entityType: 'Company',
    entityId: company.id,
  });

  const busy = verifyCompany.isPending || rejectCompany.isPending || unpublishCompany.isPending;

  const handleVerify = async () => {
    try {
      await verifyCompany.mutateAsync({ companyId: company.id, note: note || undefined });
      toast.success(`Compania „${company.name}” a fost verificată.`);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Verificarea a eșuat.');
    }
  };

  const handleReject = async () => {
    if (!confirm('Respingeți verificarea acestei companii?')) return;
    try {
      await rejectCompany.mutateAsync({ companyId: company.id, note: note || undefined });
      toast.success(`Compania „${company.name}” a fost respinsă.`);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Respingerea a eșuat.');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Retrageți compania din catalogul public?')) return;
    try {
      await unpublishCompany.mutateAsync({ companyId: company.id, note: note || undefined });
      toast.success(`Publicarea companiei „${company.name}” a fost retrasă.`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut retrage publicarea.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
            company.isVerified
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}
        >
          {company.isVerified ? 'Verificată' : 'Neverifycată'}
        </span>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
            company.isPublished
              ? 'bg-sky-50 text-sky-700 border-sky-100'
              : 'bg-gray-50 text-gray-500 border-gray-100'
          }`}
        >
          {company.isPublished ? 'Publicată' : 'Nepublicată'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="xl" className="shrink-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <InfoRow label="Denumire comercială" value={company.name} />
          <InfoRow label="Denumire legală" value={company.legalName} />
          <InfoRow label="IDNO" value={company.idno} />
          <InfoRow label="Adresă legală" value={company.legalAddress} />
          <InfoRow label="Oraș" value={company.city?.name} />
          <InfoRow label="Categorie" value={company.category?.name} />
          <InfoRow label="Plătitor TVA" value={company.isTvaPayer ? 'Da' : 'Nu'} />
          <InfoRow label="Cod TVA" value={company.tvaCode} />
          <InfoRow label="Telefon contact" value={company.contactPhone} />
          <InfoRow label="Email contact" value={company.contactEmail} />
        </div>
      </div>

      {company.description ? (
        <div>
          <p className={cabinetLabelClass}>Descriere</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">
            {company.description}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 bg-slate-50/80 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Proprietar cont</p>
        <p className="text-sm font-semibold text-gray-900">
          {[company.owner?.firstName, company.owner?.lastName].filter(Boolean).join(' ') || '—'}
        </p>
        <p className="text-sm text-gray-600">{company.owner?.email}</p>
        {company.owner?.phone ? <p className="text-sm text-gray-600">{company.owner.phone}</p> : null}
      </div>

      {company.galleryImages && company.galleryImages.length > 0 ? (
        <div>
          <p className={cabinetLabelClass}>Galerie foto ({company.galleryImages.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {company.galleryImages.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
              >
                <img
                  src={image.url}
                  alt={image.caption ?? company.name}
                  className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                />
                {image.caption ? (
                  <p className="px-2 py-1.5 text-[11px] text-gray-500 truncate">{image.caption}</p>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Nicio imagine în galerie.</p>
      )}

      {company.documents && company.documents.length > 0 ? (
        <div>
          <p className={cabinetLabelClass}>Documente</p>
          <div className="mt-2 space-y-2">
            {company.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">{doc.type}</p>
                  <p className="text-xs text-gray-400">{doc.fileKey}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {company._count ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              ['Membri', company._count.members],
              ['Clienți', company._count.customers],
              ['Lucrări', company._count.interventions],
              ['Recenzii', company._count.reviews],
              ['Servicii', company._count.services],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-violet-50/50 px-3 py-2 text-center">
              <p className="text-lg font-black text-violet-700">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">{label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <label className={cabinetLabelClass}>Notă moderare (opțional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Motiv respingere, observații interne..."
          className={`${cabinetFieldClass} resize-none mt-1`}
        />
      </div>

      <div>
        <p className={cabinetLabelClass}>Audit companie</p>
        {auditLoading ? (
          <p className="text-sm text-gray-400 mt-2">Se încarcă jurnalul...</p>
        ) : !auditLogs?.length ? (
          <p className="text-sm text-gray-400 mt-2">Nicio acțiune înregistrată.</p>
        ) : (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-2 rounded-xl border border-gray-100 p-3">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="text-xs border-b border-gray-50 pb-2 last:border-0">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-800">{auditActionLabel(entry.action)}</span>
                  <span className="text-gray-400 shrink-0">
                    {new Date(entry.createdAt).toLocaleString('ro-MD')}
                  </span>
                </div>
                <p className="text-gray-500 mt-0.5">{formatUserName(entry.user)}</p>
                {entry.newData &&
                typeof entry.newData === 'object' &&
                'note' in entry.newData &&
                entry.newData.note ? (
                  <p className="text-gray-600 mt-1 italic">{String(entry.newData.note)}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-end pt-2">
        {!company.isVerified ? (
          <button
            type="button"
            onClick={handleVerify}
            disabled={busy}
            className={cabinetBtnPrimary}
          >
            Aprobă verificarea
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleReject}
          disabled={busy}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Respinge
        </button>
        {company.isPublished ? (
          <button
            type="button"
            onClick={handleUnpublish}
            disabled={busy}
            className={cabinetBtnSecondary}
          >
            Retrage publicare
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AdminCompanyModerationModal({
  companyId,
  open,
  onClose,
}: {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const { data: company, isLoading, isError } = useAdminCompanyQuery(open ? companyId : null);

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={company ? `Moderare: ${company.name}` : 'Moderare companie'}
      size="xl"
    >
      {isLoading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Se încarcă datele companiei...</p>
      ) : isError || !company ? (
        <p className="text-sm text-red-500 py-8 text-center">Nu s-au putut încărca datele companiei.</p>
      ) : (
        <CompanyModerationContent
          company={company}
          note={note}
          setNote={setNote}
          onClose={handleClose}
        />
      )}
    </AppModal>
  );
}
