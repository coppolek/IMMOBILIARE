import React, { useState } from 'react';
import { Mail, CheckCircle2, X, Sparkles, Bell, ShieldCheck, HeartHandshake } from 'lucide-react';
import { UserProfile, MILAN_UNIVERSITIES } from '../types';
import { addOrUpdateSubscriber } from '../services/subscriberService';

interface NewsletterSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isIt?: boolean;
  onNotification?: (msg: string) => void;
}

export const NewsletterSubscribeModal: React.FC<NewsletterSubscribeModalProps> = ({
  isOpen,
  onClose,
  user,
  isIt = true,
  onNotification,
}) => {
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.displayName || '');
  const [role, setRole] = useState<'student' | 'worker' | 'landlord'>('student');
  const [selectedZones, setSelectedZones] = useState<string[]>(['Città Studi / Lambrate']);
  const [maxBudget, setMaxBudget] = useState('700');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const popularZones = [
    'Città Studi / Lambrate',
    'Bovisa / Dergano',
    'Porta Romana / Lodi',
    'Navigli / Ticinese',
    'Bicocca / Greco',
    'Loreto / NoLo',
    'Centrale / Sondrio',
  ];

  const toggleZone = (z: string) => {
    if (selectedZones.includes(z)) {
      setSelectedZones(selectedZones.filter(x => x !== z));
    } else {
      setSelectedZones([...selectedZones, z]);
    }
  };

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
        name: name.trim() || undefined,
        role,
        preferredZones: selectedZones,
        maxBudget: Number(maxBudget) || undefined,
        source: 'popup_modal',
      });

      setSubmitted(true);
      if (onNotification) {
        onNotification(isIt ? 'Iscrizione completata con successo!' : 'Subscribed successfully!');
      }
    } catch (err: any) {
      alert(isIt ? `Errore durante l'iscrizione: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white mb-3 shadow-md">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
            {isIt ? 'Newsletter & Allerte Nuovi Alloggi' : 'Newsletter & New Housing Alerts'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            {isIt 
              ? 'Ricevi ogni settimana i nuovi annunci verificati a Milano prima che finiscano sui social.' 
              : 'Get verified rooms and flats in Milan sent to your inbox before anyone else.'}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {isIt ? 'Sei ufficialmente iscritto!' : 'You are subscribed!'}
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                {isIt 
                  ? `Abbiamo salvato le tue preferenze per ${email}. Riceverai gli avvisi dedicati alle zone selezionate e il recap settimanale.` 
                  : `Your preferences for ${email} have been saved in our cloud database.`}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 max-w-sm mx-auto flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isIt ? 'Zero spam. Puoi disiscriverti in qualsiasi momento con 1 clic.' : 'No spam. Unsubscribe anytime with 1 click.'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {isIt ? 'Chiudi' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Il tuo Nome' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="es. Marco Rossi"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Email di ricezione *' : 'Email address *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="es. marco@studenti.polimi.it"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Sei uno:' : 'You are:'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="student">{isIt ? 'Studente Universitario' : 'University Student'}</option>
                  <option value="worker">{isIt ? 'Giovane Lavoratore' : 'Young Professional'}</option>
                  <option value="landlord">{isIt ? 'Proprietario / Coinquilino' : 'Landlord / Roommate'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Budget Massimo (€/mese)' : 'Max Budget (€/month)'}
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="700"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {isIt ? 'Zone di Milano di tuo interesse:' : 'Zones of interest in Milan:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {popularZones.map(zone => {
                  const isSelected = selectedZones.includes(zone);
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleZone(zone)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        isSelected 
                          ? 'bg-amber-600 text-white shadow-xs' 
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {zone}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loading 
                    ? (isIt ? 'Iscrizione in corso...' : 'Subscribing...') 
                    : (isIt ? 'Iscriviti Gratuitamente agli Avvisi' : 'Subscribe to Free Alerts')}
                </span>
              </button>
              <p className="text-[10px] text-stone-400 text-center mt-2">
                {isIt ? 'I tuoi dati vengono salvati su Firestore e protetti da crittografia.' : 'Your data is secured in Google Cloud Firestore.'}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
