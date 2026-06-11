import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellRingingIcon, TelegramLogoIcon, CopyIcon, CheckIcon } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useGenerateTelegramToken, useUpdateNotificationPreferences } from '@/features/notifications/api';

export function NotificationSettings() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isTelegramConnected = !!user?.telegramChatId;
  
  const generateToken = useGenerateTelegramToken();
  const updatePrefs = useUpdateNotificationPreferences();

  const [copied, setCopied] = useState(false);
  const [tokenData, setTokenData] = useState<{ token: string; botUrl: string } | null>(null);

  const handleConnectTelegram = async () => {
    try {
      const data = await generateToken.mutateAsync();
      setTokenData(data);
    } catch {
      toast.error(t('notifications.tokenError', 'Не удалось сгенерировать токен'));
    }
  };

  const handleCopy = () => {
    if (tokenData) {
      navigator.clipboard.writeText(`/start ${tokenData.token}`);
      setCopied(true);
      toast.success(t('notifications.copied', 'Скопировано в буфер обмена'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleInApp = async (val: boolean) => {
    try {
      await updatePrefs.mutateAsync({ inApp: val });
      toast.success(t('cabinet.common.saved', 'Сохранено'));
    } catch {
      toast.error(t('cabinet.common.error', 'Ошибка'));
    }
  };

  const handleToggleTelegram = async (val: boolean) => {
    try {
      await updatePrefs.mutateAsync({ telegram: val });
      toast.success(t('cabinet.common.saved', 'Сохранено'));
    } catch {
      toast.error(t('cabinet.common.error', 'Ошибка'));
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <BellRingingIcon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900">
          {t('notifications.settingsTitle', 'Настройки уведомлений')}
        </h3>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed mb-4">
          {t('notifications.settingsDesc', 'Выберите, как вы хотите получать уведомления о новых заказах и событиях.')}
        </p>

        <div className="space-y-4">
          {/* In-App Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="toggleInApp"
                id="toggleInApp"
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                onChange={(e) => handleToggleInApp(e.target.checked)}
                defaultChecked={user?.notifyInApp ?? true}
              />
              <label
                htmlFor="toggleInApp"
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
              ></label>
            </div>
            <span className="text-sm text-gray-800 font-medium">{t('notifications.inApp', 'В приложении')}</span>
          </label>

          {/* Telegram Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="toggleTelegram"
                id="toggleTelegram"
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                onChange={(e) => handleToggleTelegram(e.target.checked)}
                defaultChecked={user?.leadNotifyChannel === 'TELEGRAM' || user?.leadNotifyChannel === 'BOTH'}
              />
              <label
                htmlFor="toggleTelegram"
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
              ></label>
            </div>
            <span className="text-sm text-gray-800 font-medium flex items-center gap-1">
              Telegram <TelegramLogoIcon className="size-4 text-blue-500" />
            </span>
          </label>
        </div>

        {/* Telegram Connect Section */}
        <div className="mt-6 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            {t('notifications.telegramBot', 'Подключение Telegram')}
          </h4>
          
          {isTelegramConnected ? (
            <p className="text-xs font-medium text-green-600 flex items-center gap-1.5">
              <CheckIcon className="size-4" weight="bold" />
              {t('notifications.telegramConnected', 'Ваш аккаунт успешно подключен к Telegram боту.')}
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                {t('notifications.telegramBotDesc', 'Подключите Telegram бота, чтобы мгновенно получать уведомления.')}
              </p>
              {!tokenData ? (
                <button
                  onClick={handleConnectTelegram}
                  disabled={generateToken.isPending}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <TelegramLogoIcon className="size-4" />
                  {t('notifications.generateToken', 'Подключить Telegram')}
                </button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-white border border-blue-100 rounded-lg flex items-center justify-between">
                    <code className="text-xs text-blue-800 font-mono select-all">
                      /start {tokenData.token}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title={t('cabinet.common.copy')}
                    >
                      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {t('notifications.tokenInstructions', 'Скопируйте эту команду и отправьте её нашему боту: ')}
                    <a href={tokenData.botUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {tokenData.botUrl}
                    </a>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
