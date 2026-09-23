import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { addOrUpdateSubscriber } from '../services/subscriberService';

interface NewsletterWidgetProps {
  isIt?: boolean;
  onNotification?: (msg: string) => void;
}

export const NewsletterWidget: React.FC<NewsletterWidgetProps> = ({
  isIt = true,
  onNotification,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      alert(isIt ? 'Inserisci un indirizzo email valido.' : 'Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      await addOrUpdateSubscriber({
        email: email.trim(),
        source: 'portal_footer',
      });
      setSubscribed(true);
      if (onNotification) {
        onNotification(isIt ? 'Iscrizione alla newsletter completata!' : 'Subscribed to newsletter!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 my-8 overflow-hidden relative">
      {/* Decorative ambient backdrop circles */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-600/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>{isIt ? 'Newsletter & Allerte Gratuite' : 'Free Alerts & Newsletter'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-white">
            {isIt ? 'Nuove stanze a Milano prima di tutti' : 'New rooms in Milan before everyone else'}
          </h3>

          <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed">
            {isIt 
              ? 'Ricevi ogni settimana gli alloggi verificati vicino al Politecnico, Statale, Bicocca e Bocconi direttamente nella tua casella.' 
              : 'Weekly digest of vetted student rooms and flats near Milan universities. No agency spam.'}
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[340px] shrink-0">
          {subscribed ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">
                  {isIt ? 'Iscrizione confermata!' : 'Subscribed successfully!'}
                </div>
                <div className="text-stone-300 text-[11px]">
                  {isIt ? 'Riceverai la prossima edizione.' : 'You will receive the next edition.'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl focus-within:border-amber-400 transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isIt ? 'La tua email universitaria o personale...' : 'Your email address...'}
                  className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-stone-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <span>{loading ? '...' : (isIt ? 'Iscriviti' : 'Join')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-1 text-[11px] text-stone-400 px-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{isIt ? 'Zero spam. Disiscrizione con un solo clic.' : 'No spam. Unsubscribe anytime.'}</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
