import React, { useState, useMemo } from 'react';
import { 
  Search, 
  GraduationCap, 
  Briefcase, 
  Euro, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink,
  Plus,
  Heart,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { SeekerProfile, RoomType } from '../types';
import { FACEBOOK_GROUP_URL } from '../data/milanData';

interface SeekersViewProps {
  seekers: SeekerProfile[];
  onOpenAddSeeker: () => void;
  lang: 'it' | 'en';
}

export const SeekersView: React.FC<SeekersViewProps> = ({
  seekers,
  onOpenAddSeeker,
  lang,
}) => {
  const isIt = lang === 'it';
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(1200);

  const filteredSeekers = useMemo(() => {
    return seekers.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchUni = s.universityOrCompany.toLowerCase().includes(q);
        const matchBio = s.bio.toLowerCase().includes(q);
        const matchZones = s.targetZones.some(z => z.toLowerCase().includes(q));
        if (!matchName && !matchUni && !matchBio && !matchZones) return false;
      }
      if (roleFilter !== 'all' && s.role !== roleFilter) return false;
      if (s.budgetMax > maxBudgetFilter) return false;
      return true;
    });
  }, [seekers, searchTerm, roleFilter, maxBudgetFilter]);

  const roomTypeNames: Record<RoomType, string> = {
    singola: isIt ? 'Stanza Singola' : 'Single Room',
    doppia: isIt ? 'Stanza Doppia' : 'Double Room',
    monolocale: isIt ? 'Monolocale' : 'Studio',
    bilocale: isIt ? 'Bilocale' : '1-Bedroom Flat',
    posto_letto: isIt ? 'Posto Letto' : 'Bed in Shared',
  };

  return (
    <div id="seekers-view" className="space-y-4 sm:space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-4 sm:p-8 text-white border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              {isIt ? 'Bacheca Inquilini Referenziati' : 'Referenced Tenants Board'}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-stone-50 mb-1.5 sm:mb-2">
            {isIt ? 'Studenti e lavoratori in cerca di alloggio' : 'Students & workers seeking housing in Milan'}
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {isIt 
              ? 'Hai una stanza libera? Sfoglia i profili con budget, università e referenze garantite. Contattali direttamente!'
              : 'Have an available room? Browse group members looking for accommodation with verified budgets, universities, and guarantees.'}
          </p>
        </div>

        <button
          id="btn-create-seeker-post"
          onClick={onOpenAddSeeker}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isIt ? 'Inserisci il tuo profilo' : 'Post your seeker profile'}</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 shadow-xs space-y-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-seekers-input"
            type="text"
            placeholder={isIt ? "Cerca per ateneo (PoliMi, Bocconi...), nome o zona..." : "Search by university, name, or zone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500 text-xs sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Role & Budget Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-xs transition-all shrink-0 ${
                roleFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isIt ? 'Tutti i profili' : 'All profiles'}
            </button>
            <button
              onClick={() => setRoleFilter('Studente')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-xs transition-all shrink-0 ${
                roleFilter === 'Studente'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isIt ? 'Studenti' : 'Students'}
            </button>
            <button
              onClick={() => setRoleFilter('Lavoratore')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-xs transition-all shrink-0 ${
                roleFilter === 'Lavoratore'
                  ? 'bg-sky-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isIt ? 'Lavoratori' : 'Workers'}
            </button>
            <button
              onClick={() => setRoleFilter('Stagista')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-xs transition-all shrink-0 ${
                roleFilter === 'Stagista'
                  ? 'bg-purple-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isIt ? 'Stagisti' : 'Interns'}
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/80">
            <span className="text-stone-500 font-medium">{isIt ? 'Budget max:' : 'Max budget:'}</span>
            <span className="font-bold text-amber-700">€{maxBudgetFilter}</span>
            <input
              type="range"
              min="500"
              max="1500"
              step="50"
              value={maxBudgetFilter}
              onChange={(e) => setMaxBudgetFilter(Number(e.target.value))}
              className="w-24 sm:w-28 accent-amber-600 cursor-pointer h-2"
            />
          </div>
        </div>
      </div>

      {/* Grid of Seekers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSeekers.map((seeker) => (
          <div
            key={seeker.id}
            id={`seeker-card-${seeker.id}`}
            className="bg-white rounded-2xl border border-stone-200 hover:border-amber-400/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with avatar & role */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={seeker.avatar}
                    alt={seeker.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-stone-100 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                        {seeker.name}
                      </h3>
                      {seeker.verified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      {seeker.role === 'Studente' ? (
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                      )}
                      <span>{seeker.universityOrCompany}</span>
                    </div>
                  </div>
                </div>

                {/* Budget Pill */}
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-extrabold text-sm border border-amber-200">
                    €{seeker.budgetMax}
                    <span className="text-[10px] font-normal text-amber-700">/m max</span>
                  </span>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {roomTypeNames[seeker.preferredRoomType]}
                  </div>
                </div>
              </div>

              {/* Bio description */}
              <p className="text-xs text-stone-600 leading-relaxed mb-4 bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                "{seeker.bio}"
              </p>

              {/* Target Zones & Attributes */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-stone-500 font-medium">{isIt ? 'Zone target:' : 'Target zones:'}</span>
                  {seeker.targetZones.map((z, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                      {z}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{isIt ? 'Ingresso:' : 'Move-in:'} <strong>{seeker.moveInDate}</strong></span>
                  </div>
                  {seeker.hasGuarantor && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isIt ? 'Garanti Solidi' : 'Guarantor'}
                    </span>
                  )}
                  <span>• {isIt ? `Permanenza ${seeker.durationMonths} mesi` : `${seeker.durationMonths} mo. stay`}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-400">
                {isIt ? 'Pubblicato nel gruppo' : 'Posted in group'} • {seeker.createdAt}
              </span>

              <div className="flex items-center gap-2">
                <a
                  id={`contact-seeker-${seeker.id}`}
                  href={FACEBOOK_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isIt ? 'Contatta su FB' : 'Contact on FB'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
