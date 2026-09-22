import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  AlertCircle, 
  Lightbulb, 
  Building2, 
  Search,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { FACEBOOK_GROUP_URL } from '../data/milanData';

interface PostGeneratorViewProps {
  lang: 'it' | 'en';
}

export const PostGeneratorView: React.FC<PostGeneratorViewProps> = ({ lang }) => {
  const isIt = lang === 'it';

  const [postType, setPostType] = useState<'cerco' | 'offro'>('cerco');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [roomType, setRoomType] = useState('Stanza singola');
  const [budget, setBudget] = useState('650');
  const [zones, setZones] = useState('Città Studi, Lambrate, Piola, Loreto o vicino metro');
  const [moveInDate, setMoveInDate] = useState('Ottobre 2026');
  const [duration, setDuration] = useState('Almeno 1 anno (o transitorio studenti)');
  const [preferences, setPreferences] = useState('Non fumatore/trice, pulito, ordinato, rispetto degli spazi comuni');
  const [extraDetails, setExtraDetails] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [tips, setTips] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/generate-fb-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType,
          name: name || (isIt ? 'Studente referenziato' : 'Referenced student'),
          role: role || (isIt ? 'Studente al Politecnico di Milano' : 'Student at Politecnico di Milano'),
          roomType,
          budget,
          zones,
          moveInDate,
          duration,
          preferences,
          extraDetails,
        }),
      });

      const data = await res.json();
      if (data.facebookPostText) {
        setGeneratedPost(data.facebookPostText);
        setTips(data.tipsForSuccess || []);
      }
    } catch (err) {
      console.error('Failed to generate post', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div id="post-generator-view" className="max-w-5xl mx-auto space-y-6">
      {/* Title & Introduction */}
      <div className="bg-gradient-to-r from-purple-950 via-stone-900 to-stone-900 rounded-2xl p-6 sm:p-8 text-white border border-purple-900/40 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {isIt ? 'AI Post Formatter per Gruppo Facebook' : 'AI Post Formatter for Facebook Group'}
          </span>
          <span className="text-xs text-stone-400">
            Gruppo #477013955229676
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-50 mb-2">
          {isIt ? 'Genera il post perfetto per trovare casa a Milano' : 'Generate the perfect Facebook post for Milan housing'}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {isIt 
            ? 'I post generici vengono spesso ignorati. Il nostro assistente AI formula il testo in italiano e inglese con tutte le informazioni essenziali per proprietari e coinquilini (budget, contratto, metro, garanzie), pronto da incollare direttamente nel gruppo Facebook.'
            : 'Generic posts are often overlooked. Our AI formats high-converting bilingual posts with clear details (budget, contract, metro lines, guarantees) ready to paste into Facebook Group 477013955229676.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <span>1. {isIt ? 'Scegli tipologia di post' : 'Choose Post Type'}</span>
            </h3>

            {/* Type selector */}
            <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                id="btn-post-type-cerco"
                onClick={() => setPostType('cerco')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postType === 'cerco' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-stone-600'
                }`}
              >
                {isIt ? 'Cerco Casa' : 'I am Seeking'}
              </button>
              <button
                type="button"
                id="btn-post-type-offro"
                onClick={() => setPostType('offro')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postType === 'offro' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-stone-600'
                }`}
              >
                {isIt ? 'Offro Casa' : 'I am Offering'}
              </button>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Il tuo nome' : 'Your Name'}
              </label>
              <input
                id="input-post-name"
                type="text"
                placeholder={isIt ? "Es. Marco Rossi" : "E.g. Marco Rossi"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {postType === 'cerco'
                  ? (isIt ? 'Chi sei? (Corso / Ateneo o Lavoro)' : 'Who are you? (University or Job)')
                  : (isIt ? 'Chi siete in casa? (Attuali inquilini)' : 'Current flatmates profile')}
              </label>
              <input
                id="input-post-role"
                type="text"
                placeholder={isIt ? "Es. Studente Magistrale Ingegneria al PoliMi Leonardo" : "E.g. Master student in Finance at Bocconi"}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {isIt ? 'Tipologia' : 'Typology'}
                </label>
                <select
                  id="input-post-room-type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 font-medium text-stone-800 focus:outline-hidden focus:border-purple-500"
                >
                  <option value="Stanza singola">{isIt ? 'Stanza singola' : 'Single room'}</option>
                  <option value="Stanza doppia">{isIt ? 'Stanza doppia' : 'Double room'}</option>
                  <option value="Monolocale">{isIt ? 'Monolocale' : 'Studio apartment'}</option>
                  <option value="Bilocale">{isIt ? 'Bilocale' : '1-bedroom flat'}</option>
                  <option value="Posto letto">{isIt ? 'Posto letto in doppia' : 'Bed in shared room'}</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {postType === 'cerco' 
                    ? (isIt ? 'Budget max (€/mese)' : 'Max Budget (€/mo)') 
                    : (isIt ? 'Canone (€/mese)' : 'Rent (€/mo)')}
                </label>
                <input
                  id="input-post-budget"
                  type="number"
                  placeholder="650"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {postType === 'cerco'
                  ? (isIt ? 'Zone o linee metro preferite' : 'Target zones or metro lines')
                  : (isIt ? 'Zona e fermata metro più vicina' : 'Zone and closest metro station')}
              </label>
              <input
                id="input-post-zones"
                type="text"
                value={zones}
                onChange={(e) => setZones(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {isIt ? 'Data di ingresso' : 'Move-in date'}
                </label>
                <input
                  id="input-post-date"
                  type="text"
                  placeholder="Ottobre 2026"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {isIt ? 'Periodo / Durata' : 'Duration'}
                </label>
                <input
                  id="input-post-duration"
                  type="text"
                  placeholder="12 mesi / Lungo termine"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Abitudini / Note particolari' : 'Habits / Preferences / Contract'}
              </label>
              <textarea
                id="input-post-preferences"
                rows={2}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Non fumatore, pulito, garanzia genitori con contratto indeterminato..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <button
              id="btn-generate-post-action"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isLoading 
                  ? (isIt ? 'Generazione in corso con Gemini AI...' : 'Generating with Gemini AI...')
                  : (isIt ? 'Formatta Post con Gemini AI' : 'Format Post with Gemini AI')}
              </span>
            </button>
          </div>
        </div>

        {/* Output & Copy Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-stone-900 text-sm">
                    {isIt ? 'Post pronto per il Gruppo Facebook' : 'Ready-to-copy Facebook Post'}
                  </h3>
                </div>

                {generatedPost && (
                  <button
                    id="btn-copy-post-top"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isIt ? 'Copiato negli appunti!' : 'Copied!') : (isIt ? 'Copia' : 'Copy')}</span>
                  </button>
                )}
              </div>

              {generatedPost ? (
                <div className="relative">
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 max-h-[360px] overflow-y-auto">
                    {generatedPost}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs font-semibold text-stone-600 mb-1">
                    {isIt ? 'Nessun post generato finora' : 'No post generated yet'}
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    {isIt 
                      ? 'Compila il modulo a sinistra e clicca su "Formatta Post con Gemini AI" per creare la tua bozza ottimizzata.' 
                      : 'Fill out the form on the left and click "Format Post with Gemini AI" to get your optimized draft.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions for Facebook */}
            <div className="pt-4 border-t border-stone-100 space-y-3 mt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  id="btn-copy-post-bottom"
                  onClick={handleCopy}
                  disabled={!generatedPost}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isIt ? 'Testo Copiato!' : 'Text Copied!') : (isIt ? 'Copia Testo Post' : 'Copy Post Text')}</span>
                </button>

                <a
                  id="btn-open-group-to-paste"
                  href={FACEBOOK_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>{isIt ? 'Incolla nel Gruppo FB (ID 477013955229676)' : 'Open FB Group to Paste'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Tips for high conversion */}
              {tips.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isIt ? 'Consigli per ottenere più risposte:' : 'Tips for maximum replies:'}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    {tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
