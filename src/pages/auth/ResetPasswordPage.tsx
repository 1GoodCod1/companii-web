import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '@/features/auth/api/useAuth';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { Lock, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPasswordMutation();
  const nav = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError('Token-ul de resetare lipsește. Vă rugăm să solicitați din nou resetarea parolei.');
      return;
    }

    if (password.length < 8) {
      setFormError('Parola trebuie să conțină cel puțin 8 caractere.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Parolele introduse nu coincid.');
      return;
    }

    try {
      await resetPassword.mutateAsync({
        token,
        password,
      });
      setSubmitted(true);
      toast.success('Parola a fost schimbată cu succes!');
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
        {!token ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto p-4 bg-rose-50 text-rose-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Token Lipsă</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Link-ul de resetare este invalid sau a expirat. Vă rugăm să folosiți pagina de recuperare pentru a solicita un link nou.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              Solicită link nou
            </Link>
          </div>
        ) : submitted ? (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="mx-auto p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Parolă Schimbată</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Noua ta parolă a fost salvată în siguranță. Te poți autentifica acum în contul tău folosind noile credențiale.
              </p>
            </div>
            <button
              onClick={() => nav('/login', { replace: true })}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            >
              Autentifică-te
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto p-3.5 bg-violet-50 text-violet-750 rounded-2xl w-12 h-12 flex items-center justify-center shadow-3xs">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Setează Parolă Nouă</h1>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Alege o parolă sigură, ușor de reținut, formată din cel puțin 8 caractere.
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
                  Noua Parolă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all bg-white text-slate-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Confirmă Parola
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all bg-white text-slate-800"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5 active:scale-98"
              >
                {resetPassword.isPending ? 'Se procesează...' : 'Resetare Parolă'}
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
