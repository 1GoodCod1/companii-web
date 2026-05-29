import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/components/cabinet/cabinet-ui';

interface CompanyServiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  requestModal: { serviceId: string; serviceName: string } | null;
  onSubmit: (e: React.FormEvent) => void;
  profileName: string;
  profilePhone: string;
  profileEmail: string;
  message: string;
  onMessageChange: (val: string) => void;
  isPending: boolean;
}

function ClientProfileSummary({
  name,
  phone,
  email,
  title,
}: {
  name: string;
  phone: string;
  email: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs space-y-1">
      <p className="font-bold text-violet-800 uppercase tracking-wide text-[10px]">{title}</p>
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-600">{phone}</p>
      <p className="text-slate-600">{email}</p>
    </div>
  );
}

export function CompanyServiceRequestModal({
  open,
  onClose,
  requestModal,
  onSubmit,
  profileName,
  profilePhone,
  profileEmail,
  message,
  onMessageChange,
  isPending,
}: CompanyServiceRequestModalProps) {
  const { t } = useTranslation();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        requestModal
          ? t('companyDetail.requestModalTitleNamed', { name: requestModal.serviceName })
          : t('companyDetail.requestModalTitle')
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ClientProfileSummary
          name={profileName}
          phone={profilePhone}
          email={profileEmail}
          title={t('companyDetail.yourData')}
        />
        <div>
          <label className={cabinetLabelClass} htmlFor="req-msg">
            {t('companyDetail.messageLabel')}
          </label>
          <textarea
            id="req-msg"
            className={cabinetFieldClass}
            rows={3}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        </div>
        <button type="submit" className={cabinetBtnPrimary} disabled={isPending}>
          {isPending ? t('companyDetail.submitting') : t('companyDetail.submitRequest')}
        </button>
      </form>
    </AppModal>
  );
}
