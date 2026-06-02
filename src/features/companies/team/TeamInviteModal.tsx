import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  AppSelect,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { InvitableCompanyRole } from '@/entities/company/model/roles.types';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import type { InviteState, InviteMode, InviteAction } from './inviteState';

type TeamLocale = ReturnType<typeof useLocale>;

export function TeamInviteModal({
  inviteState,
  inviteRoleOptions,
  locale,
  createInvitePending,
  addDirectPending,
  onClose,
  onDispatch,
  onGenerateLink,
  onAddDirect,
  onCopyLink,
  onSwitchToLinkInvite,
}: {
  inviteState: InviteState;
  inviteRoleOptions: Array<{ value: InvitableCompanyRole; label: string }>;
  locale: TeamLocale;
  createInvitePending: boolean;
  addDirectPending: boolean;
  onClose: () => void;
  onDispatch: React.Dispatch<InviteAction>;
  onGenerateLink: (event: React.FormEvent) => void;
  onAddDirect: (event: React.FormEvent) => void;
  onCopyLink: (url: string) => void;
  onSwitchToLinkInvite: (email?: string) => void;
}) {
  const { t } = useTranslation();
  const { showInvite, inviteMode } = inviteState;

  return (
    <AppModal open={showInvite} onClose={onClose} title={t('company.teamPage.inviteModalTitle')} size="lg">
      <InviteModeTabs inviteMode={inviteMode} onDispatch={onDispatch} />
      {inviteMode === 'link' ? (
        <LinkInviteForm
          inviteState={inviteState}
          inviteRoleOptions={inviteRoleOptions}
          locale={locale}
          createInvitePending={createInvitePending}
          onDispatch={onDispatch}
          onSubmit={onGenerateLink}
          onClose={onClose}
          onCopyLink={onCopyLink}
        />
      ) : (
        <DirectInviteForm
          inviteState={inviteState}
          inviteRoleOptions={inviteRoleOptions}
          addDirectPending={addDirectPending}
          onDispatch={onDispatch}
          onSubmit={onAddDirect}
          onClose={onClose}
          onSwitchToLinkInvite={onSwitchToLinkInvite}
        />
      )}
    </AppModal>
  );
}

function InviteModeTabs({
  inviteMode,
  onDispatch,
}: {
  inviteMode: InviteMode;
  onDispatch: React.Dispatch<InviteAction>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 mb-5">
      {(['link', 'direct'] as InviteMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onDispatch({ type: 'SET_MODE', payload: mode })}
          className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
            inviteMode === mode
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {mode === 'link'
            ? t('company.teamPage.inviteModeLink')
            : t('company.teamPage.inviteModeDirect')}
        </button>
      ))}
    </div>
  );
}

function LinkInviteForm({
  inviteState,
  inviteRoleOptions,
  locale,
  createInvitePending,
  onDispatch,
  onSubmit,
  onClose,
  onCopyLink,
}: {
  inviteState: InviteState;
  inviteRoleOptions: Array<{ value: InvitableCompanyRole; label: string }>;
  locale: TeamLocale;
  createInvitePending: boolean;
  onDispatch: React.Dispatch<InviteAction>;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
  onCopyLink: (url: string) => void;
}) {
  const { t } = useTranslation();
  const { role, restrictEmail, generatedLink } = inviteState;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 leading-relaxed">
        {t('company.teamPage.linkInviteDescription')}
      </p>
      <TeamRoleSelect role={role} options={inviteRoleOptions} onDispatch={onDispatch} />
      <div>
        <label htmlFor="team-colleague-email" className={cabinetLabelClass}>
          {t('company.teamPage.colleagueEmailLabel')}
        </label>
        <input
          id="team-colleague-email"
          type="email"
          value={restrictEmail}
          onChange={(e) => onDispatch({ type: 'SET_RESTRICT_EMAIL', payload: e.target.value })}
          placeholder={t('company.teamPage.colleagueEmailPlaceholder')}
          className={cabinetFieldClass}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          {t('company.teamPage.colleagueEmailHint')}
        </p>
      </div>
      {generatedLink ? (
        <GeneratedInviteLink generatedLink={generatedLink} locale={locale} onCopyLink={onCopyLink} />
      ) : null}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('company.teamPage.close')}
        </button>
        <button type="submit" disabled={createInvitePending} className={cabinetBtnPrimary}>
          {createInvitePending
            ? t('company.teamPage.generating')
            : generatedLink
              ? t('company.teamPage.regenerateLink')
              : t('company.teamPage.generateLink')}
        </button>
      </div>
    </form>
  );
}

function GeneratedInviteLink({
  generatedLink,
  locale,
  onCopyLink,
}: {
  generatedLink: NonNullable<InviteState['generatedLink']>;
  locale: TeamLocale;
  onCopyLink: (url: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label htmlFor="team-invite-link" className={cabinetLabelClass}>
        {t('company.teamPage.inviteLinkLabel')}
      </label>
      <div className="flex gap-2">
        <input
          id="team-invite-link"
          type="text"
          readOnly
          value={generatedLink.url}
          className={`${cabinetFieldClass} text-xs font-mono`}
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={() => onCopyLink(generatedLink.url)}
          className={`${cabinetBtnSecondary} shrink-0 px-3`}
        >
          {t('company.teamPage.copy')}
        </button>
      </div>
      <p className="text-[11px] text-gray-400">
        {t('company.teamPage.expiresAtLabel')}{' '}
        {formatDateTimeLocalized(generatedLink.expiresAt, locale, 'datetimeShort')}
      </p>
    </div>
  );
}

function DirectInviteForm({
  inviteState,
  inviteRoleOptions,
  addDirectPending,
  onDispatch,
  onSubmit,
  onClose,
  onSwitchToLinkInvite,
}: {
  inviteState: InviteState;
  inviteRoleOptions: Array<{ value: InvitableCompanyRole; label: string }>;
  addDirectPending: boolean;
  onDispatch: React.Dispatch<InviteAction>;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
  onSwitchToLinkInvite: (email?: string) => void;
}) {
  const { t } = useTranslation();
  const { role, contact, directAddHint } = inviteState;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 leading-relaxed">
        {t('company.teamPage.directAddNotice')}
      </div>
      <div>
        <label htmlFor="team-contact" className={cabinetLabelClass}>
          {t('company.teamPage.contactLabel')}
        </label>
        <input
          id="team-contact"
          type="text"
          required
          value={contact}
          onChange={(e) => onDispatch({ type: 'SET_CONTACT', payload: e.target.value })}
          placeholder={t('company.teamPage.contactPlaceholder')}
          className={cabinetFieldClass}
        />
      </div>
      {directAddHint ? (
        <DirectInviteHint
          contact={contact}
          hint={directAddHint}
          onSwitchToLinkInvite={onSwitchToLinkInvite}
        />
      ) : null}
      <TeamRoleSelect role={role} options={inviteRoleOptions} onDispatch={onDispatch} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('company.teamPage.cancel')}
        </button>
        <button type="submit" disabled={addDirectPending} className={cabinetBtnPrimary}>
          {addDirectPending ? t('company.teamPage.adding') : t('company.teamPage.addToTeam')}
        </button>
      </div>
    </form>
  );
}

function DirectInviteHint({
  contact,
  hint,
  onSwitchToLinkInvite,
}: {
  contact: string;
  hint: string;
  onSwitchToLinkInvite: (email?: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-3 space-y-3">
      <p className="text-sm text-violet-900">{hint}</p>
      <button
        type="button"
        onClick={() => onSwitchToLinkInvite(contact.includes('@') ? contact : undefined)}
        className={cabinetBtnPrimary}
      >
        {contact.includes('@')
          ? t('company.teamPage.generateLinkForEmail')
          : t('company.teamPage.goToLinkInvite')}
      </button>
    </div>
  );
}

function TeamRoleSelect({
  role,
  options,
  onDispatch,
}: {
  role: InvitableCompanyRole;
  options: Array<{ value: InvitableCompanyRole; label: string }>;
  onDispatch: React.Dispatch<InviteAction>;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <label className={cabinetLabelClass}>{t('company.teamPage.roleLabel')}</label>
      <AppSelect
        value={role}
        onChange={(value) => onDispatch({ type: 'SET_ROLE', payload: value as InvitableCompanyRole })}
        options={options}
        aria-label={t('company.teamPage.roleLabel')}
      />
    </div>
  );
}