import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import { CompanyLogo } from '@/entities/company/ui/CompanyLogo';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useAdminAuditQuery,
  useAdminCompanyQuery,
  useRejectCompanyMutation,
  useUnpublishCompanyMutation,
  useVerifyCompanyMutation,
  type AdminCompanyDto,
} from '@/features/admin/api/useAdmin';
import { auditActionLabel } from '@/shared/utils/audit';
import { formatAuditActorName, formatPersonNameOrDash } from '@/shared/utils/person';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils/errors';
import { useLocale } from '@/shared/hooks/useLocale';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

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
  const { t } = useTranslation();
  const locale = useLocale();
  const { ask, dialog: confirmDialog } = useCabinetConfirmDialog();
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
      toast.success(t('admin.moderation.toastVerified', { name: company.name }));
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('admin.moderation.toastVerifyFailed')));
    }
  };

  const handleReject = () => {
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      message: t('admin.moderation.confirmReject'),
      onConfirm: async () => {
        try {
          await rejectCompany.mutateAsync({ companyId: company.id, note: note || undefined });
          toast.success(t('admin.moderation.toastRejected', { name: company.name }));
          onClose();
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('admin.moderation.toastRejectFailed')));
        }
      },
    });
  };

  const handleUnpublish = () => {
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      message: t('admin.moderation.confirmUnpublish'),
      onConfirm: async () => {
        try {
          await unpublishCompany.mutateAsync({ companyId: company.id, note: note || undefined });
          toast.success(t('admin.moderation.toastUnpublished', { name: company.name }));
          onClose();
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('admin.moderation.toastUnpublishFailed')));
        }
      },
    });
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
          {company.isVerified ? t('admin.moderation.verified') : t('admin.moderation.unverified')}
        </span>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
            company.isPublished
              ? 'bg-sky-50 text-sky-700 border-sky-100'
              : 'bg-gray-50 text-gray-500 border-gray-100'
          }`}
        >
          {company.isPublished ? t('admin.moderation.published') : t('admin.moderation.unpublished')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="xl" className="shrink-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <InfoRow label={t('admin.moderation.tradeName')} value={company.name} />
          <InfoRow label={t('admin.moderation.legalName')} value={company.legalName} />
          <InfoRow label={t('admin.moderation.idno')} value={company.idno} />
          <InfoRow label={t('admin.moderation.legalAddress')} value={company.legalAddress} />
          <InfoRow label={t('admin.moderation.city')} value={company.city?.name} />
          <InfoRow label={t('admin.moderation.category')} value={company.category?.name} />
          <InfoRow
            label={t('admin.moderation.tvaPayer')}
            value={company.isTvaPayer ? t('admin.moderation.yes') : t('admin.moderation.no')}
          />
          <InfoRow label={t('admin.moderation.tvaCode')} value={company.tvaCode} />
          <InfoRow label={t('admin.moderation.contactPhone')} value={company.contactPhone} />
          <InfoRow label={t('admin.moderation.contactEmail')} value={company.contactEmail} />
        </div>
      </div>

      {company.description ? (
        <div>
          <p className={cabinetLabelClass}>{t('admin.moderation.description')}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">
            {company.description}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 bg-slate-50/80 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {t('admin.moderation.accountOwner')}
        </p>
        <p className="text-sm font-semibold text-gray-900">
          {formatPersonNameOrDash(company.owner)}
        </p>
        <p className="text-sm text-gray-600">{company.owner?.email}</p>
        {company.owner?.phone ? <p className="text-sm text-gray-600">{company.owner.phone}</p> : null}
      </div>

      {company.galleryImages && company.galleryImages.length > 0 ? (
        <div>
          <p className={cabinetLabelClass}>
            {t('admin.moderation.photoGallery', { count: company.galleryImages.length })}
          </p>
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
        <p className="text-sm text-gray-400">{t('admin.moderation.noGalleryImages')}</p>
      )}

      {company.documents && company.documents.length > 0 ? (
        <div>
          <p className={cabinetLabelClass}>{t('admin.moderation.documents')}</p>
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
              [t('admin.moderation.statsMembers'), company._count.members],
              [t('admin.moderation.statsCustomers'), company._count.customers],
              [t('admin.moderation.statsInterventions'), company._count.interventions],
              [t('admin.moderation.statsReviews'), company._count.reviews],
              [t('admin.moderation.statsServices'), company._count.services],
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
        <label htmlFor="moderation-note" className={cabinetLabelClass}>{t('admin.moderation.moderationNote')}</label>
        <textarea
          id="moderation-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={t('admin.moderation.moderationNotePlaceholder')}
          className={`${cabinetFieldClass} resize-none mt-1`}
        />
      </div>

      <div>
        <p className={cabinetLabelClass}>{t('admin.moderation.auditTitle')}</p>
        {auditLoading ? (
          <p className="text-sm text-gray-400 mt-2">{t('admin.moderation.auditLoading')}</p>
        ) : !auditLogs?.length ? (
          <p className="text-sm text-gray-400 mt-2">{t('admin.moderation.auditEmpty')}</p>
        ) : (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-2 rounded-xl border border-gray-100 p-3">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="text-xs border-b border-gray-50 pb-2 last:border-0">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-800">{auditActionLabel(entry.action, t)}</span>
                  <span className="text-gray-400 shrink-0">
                    {formatDateTimeLocalized(entry.createdAt, locale)}
                  </span>
                </div>
                <p className="text-gray-500 mt-0.5">{formatAuditActorName(entry.user)}</p>
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
            {t('admin.moderation.approveVerification')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleReject}
          disabled={busy}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {t('admin.moderation.reject')}
        </button>
        {company.isPublished ? (
          <button
            type="button"
            onClick={handleUnpublish}
            disabled={busy}
            className={cabinetBtnSecondary}
          >
            {t('admin.moderation.unpublish')}
          </button>
        ) : null}
      </div>
      {confirmDialog}
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
  const { t } = useTranslation();
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
      title={
        company
          ? t('admin.moderation.modalTitle', { name: company.name })
          : t('admin.moderation.modalTitleFallback')
      }
      size="xl"
    >
      {isLoading ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          {t('admin.moderation.loadingCompany')}
        </p>
      ) : isError || !company ? (
        <p className="text-sm text-red-500 py-8 text-center">
          {t('admin.moderation.loadCompanyFailed')}
        </p>
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
