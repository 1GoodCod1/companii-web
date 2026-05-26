import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export function ContactsPage() {
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
      toast.error('Vă rugăm să completați toate câmpurile obligatorii.');
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
      toast.success(
        'Mesajul dvs. a fost trimis! Echipa noastră vă va contacta în cel mai scurt timp.',
      );
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-black uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full shadow-xs">
          Suport & Contact
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Contactează-ne</h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xl mx-auto">
          Ești gata să îți digitalizezi compania sau ai nevoie de ajutor în configurarea platformei? Scrie-ne și revenim rapid!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-premium space-y-6">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 uppercase tracking-wider text-xs text-gray-400">
            Informații de contact
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-gray-900 font-bold">Oficiul Central Faber</p>
                <p className="text-gray-400 mt-0.5 font-medium">bd. Ștefan cel Mare și Sfânt 1, Chișinău, Republica Moldova</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">📞</span>
              <div>
                <p className="text-gray-900 font-bold">Telefon Suport</p>
                <p className="text-violet-600 mt-0.5 font-bold hover:underline cursor-pointer">+373 68 000 000</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-xs text-gray-600 font-semibold">
              <span className="text-lg">✉️</span>
              <div>
                <p className="text-gray-900 font-bold">Email Suport</p>
                <p className="text-violet-600 mt-0.5 font-bold hover:underline cursor-pointer">support@faber.md</p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50/20 p-4 rounded-2xl border border-violet-100 text-xs text-gray-500 leading-relaxed font-semibold">
            🕒 Programul nostru de lucru este de <strong>Luni până Vineri între orele 09:00 - 18:00</strong>. Răspundem la e-mailuri de obicei în mai puțin de 2 ore de la recepționare.
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-premium space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 uppercase tracking-wider text-xs text-gray-400">
            Trimite un mesaj rapid
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Nume complet *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Ion Popescu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Adresă Email *
            </label>
            <input
              type="email"
              required
              placeholder="ion@companie.md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Mesaj sau Întrebare *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Scrie-ne cum te putem ajuta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs outline-none transition-all bg-white resize-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-xs hover:shadow-sm disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
          >
            {sending ? 'Se trimite...' : 'Trimite mesajul'}
          </button>
        </form>
      </div>
    </div>
  );
}
