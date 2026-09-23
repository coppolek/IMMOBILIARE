import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Rss, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Lock,
  LogIn
} from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { parseCSVToListings, parseRSSToListings } from '../utils/importer';
import { IMPORTED_CSV_RAW } from '../data/importedListingsRaw';
import { isUserAdmin } from '../services/authService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportListings: (listings: Listing[]) => void;
  lang: 'it' | 'en';
  user: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportListings,
  lang,
  user,
  onOpenAuth,
}) => {
  if (!isOpen) return null;
  const isIt = lang === 'it';
  const isAdmin = isUserAdmin(user);

  const [activeMode, setActiveMode] = useState<'csv' | 'rss'>('csv');
  
  // CSV State
  const [csvText, setCsvText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  // RSS State
  const [rssUrl, setRssUrl] = useState('');
  const [isFetchingRss, setIsFetchingRss] = useState(false);

  // Common Preview / Error states
  const [parsedPreview, setParsedPreview] = useState<Listing[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Non-admin view lock screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div 
          id="import-modal-restricted"
          className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-200 space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
            <Lock className="w-7 h-7 text-amber-700" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
              {isIt ? 'Accesso Riservato Amministratore' : 'Admin Restricted Access'}
            </span>
            <h3 className="font-bold text-stone-900 text-lg font-serif">
              {isIt ? 'Importazione Riservata all\'Admin' : 'Admin-Only Import Access'}
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {isIt 
                ? 'L\'importazione massiva degli annunci alloggi via Feed RSS o file CSV è una funzionalità riservata esclusivamente all\'amministratore della community (coppolek@gmail.com).' 
                : 'Batch importing housing listings via RSS Feed or CSV files is strictly reserved for the community administrator (coppolek@gmail.com).'}
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-500 text-left space-y-1">
            <div className="font-semibold text-stone-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{isIt ? 'Stato autorizzazione' : 'Authorization Status'}</span>
            </div>
            <p>
              {user 
                ? (isIt ? `Collegato come: ${user.email || 'Utente'}` : `Signed in as: ${user.email || 'User'}`)
                : (isIt ? 'Non sei autenticato come amministratore.' : 'Not signed in as administrator.')}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {!user ? (
              <button
                id="btn-import-auth-admin"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{isIt ? 'Accedi come Amministratore' : 'Sign in as Administrator'}</span>
              </button>
            ) : null}

            <button
              id="btn-close-import-restricted"
              onClick={onClose}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
            >
              {isIt ? 'Chiudi' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sampleCSVTemplate = `title,roomType,price,billsIncluded,depositMonths,zone,address,metroStation,metroLine,metroWalkingMinutes,availableFrom,photos,description,authorName
"Stanza singola moderna e luminosa a Lambrate M2",singola,680,true,2,"Lambrate / NoLo","Via Porpora 80, Milano","Lambrate FS",M2,3,"01/10/2026","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80|https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80","Affitto ampia camera singola totalmente ristrutturata per studenti universitari (vicino PoliMi Leonardo). Balcone privato, scrivania da studio e connessione fibra 1Gbps inclusa nel canone.","Marco R."
"Monolocale finemente arredato vicino Università Bocconi",monolocale,950,false,3,"Porta Romana / Crocetta","Viale Bligny, Milano","Porta Romana",M3,4,"Immediata","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80","Splendido monolocale silenzioso con affaccio interno, cucina a induzione, lavasciuga e climatizzatore a pompa di calore. Stabile signorile con portineria mezza giornata.","Elena B."`;

  const sampleRSSFeeds = [
    {
      title: 'Feed Esempio Milano Housing RSS',
      url: 'https://news.google.com/rss/search?q=affitti+milano+studenti&hl=it&gl=IT&ceid=IT:it'
    }
  ];

  const handleProcessCSV = (rawText?: string) => {
    const content = rawText || csvText;
    if (!content.trim()) {
      setErrors([isIt ? 'Inserisci o carica del testo CSV.' : 'Please provide CSV content.']);
      return;
    }

    const { listings, errors: parseErrors } = parseCSVToListings(content);
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
    } else {
      setErrors([]);
      setParsedPreview(listings);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      handleProcessCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSVTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_affitti_milano.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFetchRSS = async () => {
    if (!rssUrl.trim()) return;
    setIsFetchingRss(true);
    setErrors([]);
    setParsedPreview([]);

    try {
      const res = await fetch('/api/fetch-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rssUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore nel download del feed');
      }

      const { listings, errors: rssErrors } = parseRSSToListings(data.xml);
      if (rssErrors.length > 0) {
        setErrors(rssErrors);
      } else if (listings.length === 0) {
        setErrors([isIt ? 'Nessun annuncio o elemento trovato in questo feed RSS.' : 'No listings found in this RSS feed.']);
      } else {
        setParsedPreview(listings);
      }
    } catch (err: any) {
      setErrors([err.message || 'Errore di connessione o CORS al feed RSS.']);
    } finally {
      setIsFetchingRss(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    setIsProcessing(true);
    try {
      onImportListings(parsedPreview);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="import-modal"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base font-serif">
                  {isIt ? 'Importa Annunci Alloggi' : 'Import Rental Listings'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                  <ShieldAlert className="w-3 h-3 text-amber-700" />
                  <span>Admin</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {isIt ? 'Carica file CSV o sincronizza tramite feed URL RSS (Accesso Admin)' : 'Upload via CSV file or sync with an RSS Feed URL (Admin Access)'}
              </p>
            </div>
          </div>
          <button 
            id="btn-close-import-modal"
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: CSV vs RSS */}
        <div className="p-6 pb-2 border-b border-stone-100 bg-white">
          <div className="flex bg-stone-100 p-1 rounded-xl max-w-md">
            <button
              id="import-tab-csv"
              onClick={() => { setActiveMode('csv'); setParsedPreview([]); setErrors([]); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'csv' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isIt ? 'File CSV' : 'CSV File'}</span>
            </button>
            <button
              id="import-tab-rss"
              onClick={() => { setActiveMode('rss'); setParsedPreview([]); setErrors([]); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'rss' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Rss className="w-4 h-4 text-amber-600" />
              <span>{isIt ? 'Feed URL RSS / XML' : 'RSS / XML Feed URL'}</span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* CSV Mode */}
          {activeMode === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">
                  {isIt ? 'Carica file o incolla testo CSV' : 'Upload file or paste CSV raw text'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCsvText(IMPORTED_CSV_RAW);
                      handleProcessCSV(IMPORTED_CSV_RAW);
                    }}
                    className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isIt ? 'Carica file annunci Milano (74)' : 'Load Milano listings file (74)'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSample}
                    className="text-stone-600 hover:text-stone-800 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isIt ? 'Scarica template' : 'Download template'}</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragOver ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="font-semibold text-stone-700 text-xs sm:text-sm">
                  {isIt ? 'Trascina qui il tuo file CSV' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-[11px] text-stone-400 mt-1 mb-3">
                  {isIt ? 'Supporta virgole o punto e virgola come separatore' : 'Supports comma or semicolon separators'}
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-700 font-semibold cursor-pointer hover:bg-stone-50 shadow-xs">
                  <span>{isIt ? 'Sfoglia file' : 'Browse file'}</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                </label>
              </div>

              {/* Or paste text */}
              <div>
                <label className="block text-stone-600 font-medium mb-1 text-[11px]">
                  {isIt ? 'Oppure incolla il contenuto CSV qui:' : 'Or paste CSV content directly:'}
                </label>
                <textarea
                  id="csv-text-input"
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={sampleCSVTemplate}
                  className="w-full font-mono text-[11px] p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    id="btn-parse-csv"
                    onClick={() => handleProcessCSV()}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                  >
                    {isIt ? 'Analizza CSV' : 'Parse CSV'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RSS Mode */}
          {activeMode === 'rss' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isIt ? 'URL del Feed RSS / XML' : 'RSS / XML Feed URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="rss-url-input"
                    type="url"
                    placeholder="https://example.com/feed/affitti.xml"
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchRSS()}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                  <button
                    id="btn-fetch-rss"
                    onClick={handleFetchRSS}
                    disabled={isFetchingRss || !rssUrl.trim()}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Rss className="w-3.5 h-3.5" />
                    <span>{isFetchingRss ? (isIt ? 'Sincronizzazione...' : 'Fetching...') : (isIt ? 'Scarica Feed' : 'Fetch Feed')}</span>
                  </button>
                </div>
              </div>

              {/* Sample feed chip */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block mb-1.5">
                  {isIt ? 'Feed di prova suggerito:' : 'Suggested sample feed:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleRSSFeeds.map((feed, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setRssUrl(feed.url);
                      }}
                      className="text-left bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-[11px] hover:border-amber-400 text-stone-700"
                    >
                      <span className="font-semibold text-stone-900 block">{feed.title}</span>
                      <span className="text-stone-400 truncate block max-w-sm">{feed.url}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors box */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{isIt ? 'Attenzione durante l\'importazione:' : 'Import Notice:'}</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview of Parsed Listings */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isIt 
                      ? `${parsedPreview.length} annunci pronti per essere importati nel Database:` 
                      : `${parsedPreview.length} listings ready to be imported into Database:`}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {isIt ? 'Verranno salvati su Cloud Firestore' : 'Will be saved to Cloud Firestore'}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {parsedPreview.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/90 flex gap-3.5 text-xs transition-colors"
                  >
                    {/* Photo thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-stone-200 border border-stone-300/60 relative">
                      <img 
                        src={item.photos[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80'} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Gracefully handle broken external image links
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      {item.photos.length > 1 && (
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded-sm">
                          +{item.photos.length - 1}
                        </span>
                      )}
                    </div>

                    {/* Listing details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                            {item.title}
                          </h4>
                          <span className="font-extrabold text-amber-900 font-serif whitespace-nowrap text-xs sm:text-sm">
                            €{item.price}/m
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-stone-500 font-medium">
                          <span className="px-1.5 py-0.5 rounded-md bg-stone-200/70 text-stone-700 text-[10px] font-semibold uppercase">
                            {item.roomType}
                          </span>
                          <span>•</span>
                          <span>{item.zone}</span>
                          <span>•</span>
                          <span className="text-stone-600">{item.metroLine} {item.metroStation}</span>
                        </div>

                        {/* Description snippet */}
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                        <span>{item.authorName}</span>
                        <span>{item.billsIncluded ? (isIt ? 'Spese incluse' : 'Bills included') : `+€${item.billsEstimate} spese`}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl"
          >
            {isIt ? 'Annulla' : 'Cancel'}
          </button>

          <button
            id="btn-confirm-import-db"
            onClick={handleConfirmImport}
            disabled={parsedPreview.length === 0 || isProcessing}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isProcessing 
                ? (isIt ? 'Salvataggio nel Database...' : 'Saving to Database...') 
                : (isIt ? `Salva ${parsedPreview.length} annunci nel Database` : `Save ${parsedPreview.length} listings to Database`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
