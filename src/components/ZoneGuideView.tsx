import React, { useState } from 'react';
import { 
  MapPin, 
  Train, 
  Euro, 
  GraduationCap, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Compass,
  Building,
  Send
} from 'lucide-react';
import { MILAN_ZONES } from '../data/milanData';
import { MilanZoneInfo } from '../types';

interface ZoneGuideViewProps {
  lang: 'it' | 'en';
}

export const ZoneGuideView: React.FC<ZoneGuideViewProps> = ({ lang }) => {
  const isIt = lang === 'it';

  const [selectedZone, setSelectedZone] = useState<MilanZoneInfo>(MILAN_ZONES[0]);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskAdvisor = async (q?: string) => {
    const query = q || advisorQuestion;
    if (!query.trim()) return;
    setIsAsking(true);
    try {
      const res = await fetch('/api/rental-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      setAdvisorAnswer(data.answer);
    } catch (err) {
      console.error('Advisor error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    isIt ? "Qual è la differenza tra contratto 4+4 e transitorio per studenti?" : "What is the difference between a 4+4 lease and a student temporary contract?",
    isIt ? "Cosa comprende la 'Cedolare Secca' e chi paga l'imposta di registro?" : "What is Cedolare Secca and who pays the registration tax?",
    isIt ? "Quanto costa mediamente vivere da studente a Milano tra affitto, spesa e metro?" : "What is the average monthly cost of living in Milan for a student?",
    isIt ? "Posso prendere la residenza a Milano con un contratto transitorio studenti?" : "Can I register official residency with a student lease?",
  ];

  return (
    <div id="zone-guide-view" className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-6 sm:p-8 text-white border border-stone-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            {isIt ? 'Guida Quartieri & Prezzi Milano' : 'Milan Districts & Rent Guide'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-50 mb-2">
          {isIt ? 'Confronta le zone di Milano per studenti ed expat' : 'Compare Milan neighborhoods for students & expats'}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {isIt 
            ? 'Prezzi medi aggiornati, linee della metropolitana (M1, M2, M3, M4, M5), vicinanza ai principali campus universitari (PoliMi, Bocconi, Cattolica, Statale, Bicocca) e vibe del quartiere.'
            : 'Average benchmark rents, metro connectivity, proximity to universities, and district atmosphere.'}
        </p>
      </div>

      {/* Zone Selector & Details */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 items-start">
        {/* Mobile Horizontal Carousel for Districts */}
        <div className="lg:hidden bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs">
          <div className="text-xs font-bold text-stone-600 mb-2 px-1">
            {isIt ? 'Scegli un quartiere da confrontare:' : 'Choose a district to explore:'}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            {MILAN_ZONES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  id={`mobile-zone-chip-${zone.id}`}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border text-left ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div>{zone.name}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-stone-950 font-extrabold' : 'text-stone-400 font-normal'}`}>
                    ~€{zone.averageSingleRoom}/m
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Zone List (4 cols) */}
        <div className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            {isIt ? 'Quartieri Universitari' : 'University Districts'}
          </div>
          {MILAN_ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <button
                key={zone.id}
                id={`zone-btn-${zone.id}`}
                onClick={() => setSelectedZone(zone)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-amber-50 border border-amber-300 text-stone-900 shadow-xs font-bold' 
                    : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-semibold">{zone.name}</div>
                  <div className="text-[11px] text-stone-400">
                    {isIt ? 'Singola da' : 'Single from'} <span className="font-bold text-amber-700">~€{zone.averageSingleRoom}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {zone.metroLines.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-stone-900 text-white"
                    >
                      {m}
                    </span>
                  ))}
                  <ChevronRight className={`w-4 h-4 ml-1 ${isSelected ? 'text-amber-600' : 'text-stone-300'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Deep Dive (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-bold text-stone-900 font-serif">
                  {selectedZone.name}
                </h3>
              </div>
              <p className="text-xs text-stone-500">{selectedZone.vibe}</p>
            </div>

            {/* Price Radar Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center">
                <div className="text-[10px] text-amber-800 font-semibold uppercase">
                  {isIt ? 'Media Singola' : 'Avg Single'}
                </div>
                <div className="text-base font-extrabold text-amber-900">
                  €{selectedZone.averageSingleRoom}
                  <span className="text-[10px] font-normal text-amber-700">/m</span>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-center">
                <div className="text-[10px] text-stone-500 font-semibold uppercase">
                  {isIt ? 'Media Monolocale' : 'Avg Studio'}
                </div>
                <div className="text-base font-extrabold text-stone-800">
                  €{selectedZone.averageStudio}
                  <span className="text-[10px] font-normal text-stone-500">/m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {selectedZone.description}
          </div>

          {/* Universities & Metro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>{isIt ? 'Atenei comodi o vicini:' : 'Convenient Universities:'}</span>
              </h4>
              <ul className="space-y-1">
                {selectedZone.universitiesNearby.map((u, idx) => (
                  <li key={idx} className="text-xs text-stone-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-sky-600" />
                <span>{isIt ? 'Collegamenti Metropolitani:' : 'Metro Connections:'}</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedZone.metroLines.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-stone-900 text-white flex items-center gap-1"
                  >
                    <span>Linea {m}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pros */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-stone-900 mb-2">
              {isIt ? 'Perché scegliere questa zona:' : 'Why choose this district:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedZone.pros.map((p, idx) => (
                <div key={idx} className="text-xs text-stone-700 bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Milan Rental Advisor Q&A Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              {isIt ? 'Consulente Legale & Fiscale AI per Affitti a Milano' : 'AI Legal & Tax Rental Advisor for Milan'}
            </h3>
            <p className="text-xs text-stone-500">
              {isIt ? 'Fai qualsiasi domanda su contratti, caparra, registrazione Agenzia delle Entrate o spese condominiali.' : 'Ask anything about Italian tenancy law, deposit limits, or lease registration.'}
            </p>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAdvisorQuestion(q);
                handleAskAdvisor(q);
              }}
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg transition-colors border border-stone-200/60 text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Question input */}
        <div className="flex gap-2">
          <input
            id="advisor-question-input"
            type="text"
            placeholder={isIt ? "Es. Chi paga le spese condominiali e le bollette? o Quali documenti servono ad un garante?" : "E.g. Who pays condominium expenses? What documents does a guarantor need?"}
            value={advisorQuestion}
            onChange={(e) => setAdvisorQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-purple-500"
          />
          <button
            id="advisor-ask-button"
            onClick={() => handleAskAdvisor()}
            disabled={isAsking || !advisorQuestion.trim()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAsking ? (isIt ? 'Risposta in corso...' : 'Thinking...') : (isIt ? 'Chiedi' : 'Ask')}</span>
          </button>
        </div>

        {/* AI Answer Box */}
        {advisorAnswer && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-xs sm:text-sm text-stone-800 leading-relaxed space-y-3">
            <div className="font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{isIt ? 'Risposta dell\'Esperto AI:' : 'AI Expert Answer:'}</span>
            </div>
            <div className="whitespace-pre-wrap font-sans">
              {advisorAnswer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
