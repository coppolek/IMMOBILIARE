import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Shield,
  FileCheck
} from 'lucide-react';
import { SCAM_PRESETS, MILAN_LEGAL_GUIDE, FACEBOOK_GROUP_URL } from '../data/milanData';
import { ScamAnalysisResult } from '../types';

interface ScamDetectorViewProps {
  initialText?: string;
  initialPrice?: number;
  initialZone?: string;
  lang: 'it' | 'en';
}

export const ScamDetectorView: React.FC<ScamDetectorViewProps> = ({
  initialText = '',
  initialPrice,
  initialZone,
  lang,
}) => {
  const isIt = lang === 'it';

  const [inputContent, setInputContent] = useState(initialText);
  const [quotedPrice, setQuotedPrice] = useState<string>(initialPrice ? String(initialPrice) : '');
  const [targetZone, setTargetZone] = useState<string>(initialZone || '');
  const [depositMonths, setDepositMonths] = useState<string>('2');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  const handleRunAnalysis = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputContent,
          price: quotedPrice ? Number(quotedPrice) : undefined,
          zone: targetZone,
          depositMonths: depositMonths ? Number(depositMonths) : undefined,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error in scam check:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (preset: typeof SCAM_PRESETS[0]) => {
    setInputContent(preset.text);
    setQuotedPrice(String(preset.price));
    setTargetZone(preset.zone);
    setResult(null);
  };

  return (
    <div id="scam-detector-view" className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {isIt ? 'Scudo Anti-Truffa Affitti Milano' : 'Milan Rental Anti-Scam Shield'}
          </span>
          <span className="text-xs text-stone-400">
            Gruppo FB #477013955229676
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-50 mb-2">
          {isIt ? 'Verifica annunci e messaggi sospetti con l\'AI' : 'Analyze suspicious listings & messages with AI'}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {isIt 
            ? 'I gruppi di affitto a Milano sono presi di mira da finte proposte di proprietari "all\'estero" o richieste di caparra prima della visita. Incolla qui il testo del post, del messaggio Messenger o WhatsApp per un controllo immediato basato sulle leggi italiane.'
            : 'Milan rental groups frequently encounter fake landlords claiming to be abroad or requesting wire transfers prior to viewing. Paste any message or post here to run our AI scam detector.'}
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{isIt ? 'Oppure prova uno dei casi reali tipici di Milano:' : 'Or test a typical Milan rental case study:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCAM_PRESETS.map((p, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              type="button"
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200/80 text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyzer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Box (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm">
            {isIt ? '1. Incolla testo dell\'annuncio o chat con il proprietario' : '1. Paste listing text or landlord chat'}
          </h3>

          <textarea
            id="scam-text-input"
            rows={7}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={isIt ? "Incolla qui la descrizione del post Facebook, email o messaggio WhatsApp ricevuto..." : "Paste the Facebook post text, email, or WhatsApp message here..."}
            className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed placeholder:text-stone-400"
          />

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Canone (€/m)' : 'Rent (€/mo)'}
              </label>
              <input
                id="scam-input-price"
                type="number"
                placeholder="650"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Zona / Via' : 'Zone / Street'}
              </label>
              <input
                id="scam-input-zone"
                type="text"
                placeholder="Es. Piola, Duomo"
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Mesi caparra' : 'Deposit mos.'}
              </label>
              <select
                id="scam-input-deposit"
                value={depositMonths}
                onChange={(e) => setDepositMonths(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50/60 font-medium text-stone-800 focus:outline-hidden"
              >
                <option value="1">1 mese</option>
                <option value="2">2 mesi</option>
                <option value="3">3 mesi (max legale)</option>
                <option value="4">4 mesi (sospetto)</option>
                <option value="6">6 mesi (illegale)</option>
              </select>
            </div>
          </div>

          <button
            id="btn-run-scam-analysis"
            onClick={handleRunAnalysis}
            disabled={isLoading || !inputContent.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {isLoading 
                ? (isIt ? 'Analisi in corso con Gemini AI...' : 'Analyzing with Gemini AI...')
                : (isIt ? 'Analizza Rischio Truffa con AI' : 'Check for Scam Risk with AI')}
            </span>
          </button>
        </div>

        {/* Results Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              {/* Verdict Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  {result.riskLevel === 'HIGH_RISK_SCAM' ? (
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  ) : result.riskLevel === 'CAUTION' ? (
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {isIt ? 'Esito Analisi Sicurezza' : 'Safety Analysis Outcome'}
                    </span>
                    <h4 className={`text-base font-extrabold ${
                      result.riskLevel === 'HIGH_RISK_SCAM' 
                        ? 'text-red-700' 
                        : result.riskLevel === 'CAUTION' 
                        ? 'text-amber-700' 
                        : 'text-emerald-700'
                    }`}>
                      {result.riskLevel === 'HIGH_RISK_SCAM' && (isIt ? 'ALTO RISCHIO TRUFFA' : 'HIGH RISK SCAM')}
                      {result.riskLevel === 'CAUTION' && (isIt ? 'ATTENZIONE / ELEMENTI SOSPETTI' : 'CAUTION REQUIRED')}
                      {result.riskLevel === 'SAFE' && (isIt ? 'ANNUNCIO COERENTE & LEGITTIMO' : 'LIKELY SAFE LISTING')}
                    </h4>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="text-right">
                  <div className="text-xl font-extrabold text-stone-900 font-mono">
                    {result.score}<span className="text-xs text-stone-400">/100</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {isIt ? 'Indice di Rischio' : 'Risk Index'}
                  </span>
                </div>
              </div>

              {/* Summary description */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                {result.verdict}
              </p>

              {/* Detected Red Flags */}
              {result.redFlags && result.redFlags.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>{isIt ? 'Campanelli d\'allarme rilevati:' : 'Identified Red Flags:'}</span>
                  </h5>
                  <ul className="space-y-1">
                    {result.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-xs text-red-700 bg-red-50/70 px-3 py-1.5 rounded-lg border border-red-100">
                        • {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price Assessment */}
              {result.priceAssessment && (
                <div className="text-xs bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-amber-900">
                  <strong>{isIt ? 'Valutazione Canone:' : 'Rent Benchmark:'}</strong> {result.priceAssessment}
                </div>
              )}

              {/* Action advice */}
              {result.actionAdvice && result.actionAdvice.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <h5 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isIt ? 'Cosa devi verificare adesso:' : 'Next steps to stay safe:'}</span>
                  </h5>
                  <ul className="space-y-1">
                    {result.actionAdvice.map((adv, idx) => (
                      <li key={idx} className="text-xs text-stone-600 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400">
              <Shield className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h4 className="text-sm font-bold text-stone-700 mb-1">
                {isIt ? 'In attesa di analisi' : 'Awaiting analysis'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {isIt 
                  ? 'Incolla un annuncio o messaggio e avvia l\'analisi per visualizzare il report di sicurezza dettagliato.'
                  : 'Paste an ad or chat snippet to generate an immediate safety assessment.'}
              </p>
            </div>
          )}

          {/* Italian Rental Legal Rules Cards */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-600" />
              <span>{isIt ? 'Le 4 Regole d\'Oro dell\'Affitto a Milano' : '4 Essential Rules for Milan Rentals'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MILAN_LEGAL_GUIDE.map((g, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900">{g.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                      {g.badge}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {g.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
