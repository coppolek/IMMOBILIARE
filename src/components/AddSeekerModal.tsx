import React, { useState } from 'react';
import { X, Search, GraduationCap } from 'lucide-react';
import { SeekerProfile, RoomType, UserProfile } from '../types';

interface AddSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSeeker: (seeker: SeekerProfile) => void;
  lang: 'it' | 'en';
  user?: UserProfile | null;
}

export const AddSeekerModal: React.FC<AddSeekerModalProps> = ({
  isOpen,
  onClose,
  onAddSeeker,
  lang,
  user
}) => {
  if (!isOpen) return null;
  const isIt = lang === 'it';

  const [name, setName] = useState(user?.displayName || '');
  const [role, setRole] = useState<'Studente' | 'Lavoratore' | 'Stagista'>(
    user?.role === 'worker' ? 'Lavoratore' : 'Studente'
  );
  const [universityOrCompany, setUniversityOrCompany] = useState(user?.university || '');
  const [budgetMax, setBudgetMax] = useState('700');
  const [preferredRoomType, setPreferredRoomType] = useState<RoomType>('singola');
  const [targetZones, setTargetZones] = useState('Città Studi, Lambrate, Piola');
  const [moveInDate, setMoveInDate] = useState('Ottobre 2026');
  const [durationMonths, setDurationMonths] = useState(12);
  const [bio, setBio] = useState(user?.bio || '');
  const [hasGuarantor, setHasGuarantor] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSeeker: SeekerProfile = {
      id: `seek-${Date.now()}`,
      name: name.trim() || user?.displayName || 'Cercatore',
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role,
      universityOrCompany: universityOrCompany || (isIt ? 'Studente a Milano' : 'Student in Milan'),
      budgetMax: Number(budgetMax),
      preferredRoomType,
      targetZones: targetZones.split(',').map(s => s.trim()).filter(Boolean),
      moveInDate,
      durationMonths,
      bio: bio || (isIt ? 'Ragazzo/a ordinato/a, rispettoso/a degli spazi comuni e con garanzie solide.' : 'Clean, quiet person with solid guarantees looking for a room.'),
      smoking: false,
      pets: false,
      hasGuarantor,
      verified: true,
      createdAt: isIt ? 'Appena pubblicato' : 'Just now',
    };

    onAddSeeker(newSeeker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="add-seeker-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden my-0 sm:my-8 max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden bg-stone-50 flex justify-center">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
              {isIt ? 'Crea il tuo profilo di ricerca (Cerco Casa)' : 'Post your Seeker Profile'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs flex-1">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {isIt ? 'Nome e Cognome' : 'Full Name'} *
            </label>
            <input
              id="new-seeker-name"
              type="text"
              required
              placeholder={isIt ? "Es. Matteo Bianchi" : "E.g. Matteo Bianchi"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Ruolo' : 'Role'}
              </label>
              <select
                id="new-seeker-role"
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="Studente">{isIt ? 'Studente universitario' : 'University student'}</option>
                <option value="Lavoratore">{isIt ? 'Giovane lavoratore' : 'Young professional'}</option>
                <option value="Stagista">{isIt ? 'Stagista / Tirocinante' : 'Intern'}</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Ateneo o Azienda' : 'University or Workplace'}
              </label>
              <input
                id="new-seeker-uni"
                type="text"
                placeholder={isIt ? "Es. PoliMi Leonardo (Ing. Gestionale)" : "E.g. Bocconi (Finance)"}
                value={universityOrCompany}
                onChange={(e) => setUniversityOrCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Budget Massimo (€/mese)' : 'Max Budget (€/mo)'} *
              </label>
              <input
                id="new-seeker-budget"
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Tipologia desiderata' : 'Desired Room'}
              </label>
              <select
                id="new-seeker-room-type"
                value={preferredRoomType}
                onChange={(e: any) => setPreferredRoomType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="singola">{isIt ? 'Stanza Singola' : 'Single Room'}</option>
                <option value="doppia">{isIt ? 'Stanza Doppia' : 'Double Room'}</option>
                <option value="monolocale">{isIt ? 'Monolocale' : 'Studio'}</option>
                <option value="bilocale">{isIt ? 'Bilocale' : '1-Bedroom Flat'}</option>
                <option value="posto_letto">{isIt ? 'Posto Letto' : 'Bed in Shared'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {isIt ? 'Zone target preferite (separate da virgola)' : 'Target zones (comma separated)'}
            </label>
            <input
              id="new-seeker-zones"
              type="text"
              value={targetZones}
              onChange={(e) => setTargetZones(e.target.value)}
              placeholder="Città Studi, Lambrate, Piola, Navigli"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Data di ingresso' : 'Move-in date'}
              </label>
              <input
                id="new-seeker-date"
                type="text"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Mesi previsti' : 'Stay (months)'}
              </label>
              <input
                id="new-seeker-months"
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {isIt ? 'Presentazione (Bio, abitudini, garanzie)' : 'Presentation (Bio, habits, guarantor)'}
            </label>
            <textarea
              id="new-seeker-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isIt ? "Racconta chi sei, le tue passioni, se hai genitori garanti a tempo indeterminato..." : "Tell landlords about yourself, your habits, and guarantees..."}
              className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
            <input
              id="new-seeker-guarantor"
              type="checkbox"
              checked={hasGuarantor}
              onChange={(e) => setHasGuarantor(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded"
            />
            <label htmlFor="new-seeker-guarantor" className="font-semibold text-stone-800 cursor-pointer">
              {isIt ? 'Ho garanti con busta paga solida / contratto a tempo indeterminato' : 'I have a solid guarantor with permanent employment contract'}
            </label>
          </div>

          <div className="pt-3 border-t border-stone-200 bg-white sticky bottom-0 z-10 p-3 sm:p-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 flex items-center justify-end gap-2 pb-[max(env(safe-area-inset-bottom,0px),14px)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl text-xs sm:text-sm"
            >
              {isIt ? 'Annulla' : 'Cancel'}
            </button>
            <button
              id="btn-submit-new-seeker"
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs text-xs sm:text-sm"
            >
              {isIt ? 'Pubblica Profilo' : 'Post Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
