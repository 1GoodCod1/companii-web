import { useTranslation } from 'react-i18next';
import {
  AppSelect,
  Panel,
  PanelHeader,
  cabinetLabelClass,
  cabinetBtnPrimary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';

export function TransferOwnershipPanel({
  isOwner,
  transferableMembers,
  transferTargetUserId,
  transferMemberOptions,
  transferPending,
  onTransferTargetUserIdChange,
  onSubmit,
}: {
  isOwner: boolean;
  transferableMembers: CompanyMemberDto[];
  transferTargetUserId: string;
  transferMemberOptions: Array<{ value: string; label: string }>;
  transferPending: boolean;
  onTransferTargetUserIdChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const { t } = useTranslation();

  if (!isOwner || transferableMembers.length === 0) return null;

  return (
    <Panel>
      <PanelHeader title={t('company.teamPage.transferTitle')} />
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">{t('company.teamPage.transferDescription')}</p>
        <div>
          <label className={cabinetLabelClass}>{t('company.teamPage.newOwnerLabel')}</label>
          <AppSelect
            value={transferTargetUserId}
            onChange={onTransferTargetUserIdChange}
            options={transferMemberOptions}
            aria-label={t('company.teamPage.newOwnerLabel')}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={transferPending} className={cabinetBtnPrimary}>
            {transferPending
              ? t('company.teamPage.transferring')
              : t('company.teamPage.transferBtn')}
          </button>
        </div>
      </form>
    </Panel>
  );
}