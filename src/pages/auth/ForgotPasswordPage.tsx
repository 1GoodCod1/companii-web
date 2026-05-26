import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '@/features/auth/api/useAuth';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await forgotPassword.mutateAsync({ email: email.trim() });
      setSubmitted(true);
      toast.success('Emailul de recuperare a fost trimis!');
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 animate-fade-in relative z-10">
      {/* Decorative blurred blob */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/85 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-premium relative overflow-hidden">
        {submitted ? (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="mx-auto p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Link Trimis</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Dacă adresa <strong>{email}</strong> există în baza de date, a fost trimis un link securizat pentru resetarea parolei. Vă rugăm să verificați căsuța poștală (inclusiv folderul Spam).
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la Autentificare
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto p-3.5 bg-violet-50 text-violet-750 rounded-2xl w-12 h-12 flex items-center justify-center shadow-3xs">
                <KeyRound className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recuperare Parolă</h1>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Introdu adresa de email înregistrată. Îți vom trimite un link securizat valabil timp de o oră pentru a-ți alege o nouă parolă.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 leading-relaxed">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Adresă Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="email@exemplu.md"
                    className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all bg-white text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5 active:scale-98"
              >
                {forgotPassword.isPending ? 'Se trimite...' : 'Trimite Link de Resetare'}
              </button>
            </form>

            <div className="border-t border-slate-100 pt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-650 hover:text-violet-750 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Înapoi la Autentificare
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
