import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { PublicPageHeader } from '@/shared/ui/PublicPageHeader';

export function ContactsPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error(t('contacts.validationError'));
      return;
    }
    setSending(true);
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      pendingTimerRef.current = null;
      setSending(false);
      setName('');
      setEmail('');
      setMessage('');
      toast.success(t('contacts.successMessage'));
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <PublicPageHeader
        badge={t('contacts.badge')}
        title={t('contacts.title')}
        description={t('contacts.subtitle')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info */}
        <div className="p-6 rounded-3xl border border-gray-100 glass-panel space-y-6">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 uppercase tracking-wider text-xs text-gray-400">
            {t('contacts.infoTitle')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-gray-900 font-bold">{t('contacts.officeName')}</p>
                <p className="text-gray-400 mt-0.5 font-medium">{t('contacts.officeAddress')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">📞</span>
              <div>
                <p className="text-gray-900 font-bold">{t('contacts.phoneLabel')}</p>
                <p className="text-violet-600 mt-0.5 font-bold hover:underline cursor-pointer">+373 68 000 000</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">✉️</span>
              <div>
                <p className="text-gray-900 font-bold">{t('contacts.emailLabel')}</p>
                <p className="text-violet-600 mt-0.5 font-bold hover:underline cursor-pointer">support@faber.md</p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50/20 p-4 rounded-2xl border border-violet-100 text-xs text-gray-500 leading-relaxed font-semibold">
            🕒 {t('contacts.hoursNote')}
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-gray-100 glass-panel space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 uppercase tracking-wider text-xs text-gray-400">
            {t('contacts.formTitle')}
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('contacts.nameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('contacts.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('contacts.emailFieldLabel')}
            </label>
            <input
              type="email"
              required
              placeholder={t('contacts.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('contacts.messageLabel')}
            </label>
            <textarea
              required
              rows={4}
              placeholder={t('contacts.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white resize-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-3 px-4 rounded-xl transition-all disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
          >
            {sending ? t('contacts.submitting') : t('contacts.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
