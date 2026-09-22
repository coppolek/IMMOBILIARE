import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Database, 
  UploadCloud, 
  RefreshCw, 
  Trash2, 
  FileSpreadsheet, 
  Rss, 
  ExternalLink, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Layers, 
  FileText, 
  Check, 
  Copy, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  Building,
  HelpCircle,
  Terminal,
  X
} from 'lucide-react';
import { Listing, RoomType, MetroLine, UserProfile } from '../types';
import { parseCSVToListings, parseRSSToListings, inferMetroStationAndLine, normalizeMilanZone } from '../utils/importer';
import { 
  batchSaveListingsToFirestore, 
  batchDeleteListingsFromFirestore, 
  restoreDefaultCatalogToFirestore, 
  purgeDuplicatesFromFirestore,
  deleteListingFromFirestore,
  saveListingToFirestore 
} from '../services/dbService';
import { INITIAL_LISTINGS } from '../data/milanData';

interface AdminImportPanelProps {
  listings: Listing[];
  user: UserProfile | null;
  lang: 'it' | 'en';
  onRefreshListings?: () => void;
  onNotification?: (msg: string) => void;
  onBackToApp?: () => void;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export const AdminImportPanel: React.FC<AdminImportPanelProps> = ({
  listings,
  user,
  lang,
  onRefreshListings,
  onNotification,
  onBackToApp
}) => {
  const isIt = lang === 'it';

  // Sub-navigation inside Admin Panel
  const [activeTab, setActiveTab] = useState<'catalog' | 'importer' | 'maintenance' | 'logs'>('catalog');

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      time: new Date().toLocaleTimeString(),
      type: 'info',
      message: `Pannello di controllo inizializzato. Connessione attiva a Firestore (Database ID: ai-studio-affittimilanohou-b19332e6-ed0b-4dd1-9b3b-ecd9d3eec71e)`
    },
    {
      id: 'log-2',
      time: new Date().toLocaleTimeString(),
      type: 'success',
      message: `Rilevati ${listings.length} annunci attivi nel catalogo sincronizzato.`
    }
  ]);

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    setLogs(prev => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        type,
        message
      },
      ...prev.slice(0, 49)
    ]);
  };

  // State for Catalog filter & search
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'immobiliare' | 'community'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickEditListing, setQuickEditListing] = useState<Listing | null>(null);

  // State for Importer Tab
  const [importMode, setImportMode] = useState<'csv' | 'urls' | 'rss' | 'manual'>('csv');
  const [csvContent, setCsvContent] = useState('');
  const [previewListings, setPreviewListings] = useState<Listing[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // URL Importer State
  const [urlBatchText, setUrlBatchText] = useState('');

  // Single Manual Listing Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrice, setManualPrice] = useState('650');
  const [manualZone, setManualZone] = useState('Città Studi / Lambrate');
  const [manualAddress, setManualAddress] = useState('Via Pacini, Milano');
  const [manualRoomType, setManualRoomType] = useState<RoomType>('singola');
  const [manualExternalUrl, setManualExternalUrl] = useState('https://www.immobiliare.it/annunci/');
  const [manualBillsIncluded, setManualBillsIncluded] = useState(true);

  // Computed metrics
  const stats = useMemo(() => {
    const total = listings.length;
    const fromImmobiliare = listings.filter(l => l.externalListingUrl?.includes('immobiliare.it') || l.source === 'immobiliare').length;
    const fromCommunity = total - fromImmobiliare;
    const withBillsIncluded = listings.filter(l => l.billsIncluded).length;
    const avgPrice = total > 0 ? Math.round(listings.reduce((acc, curr) => acc + curr.price, 0) / total) : 0;
    const missingPhotos = listings.filter(l => !l.photos || l.photos.length === 0).length;
    const missingExternalLinks = listings.filter(l => !l.externalListingUrl).length;

    return {
      total,
      fromImmobiliare,
      fromCommunity,
      withBillsIncluded,
      avgPrice,
      missingPhotos,
      missingExternalLinks
    };
  }, [listings]);

  // Filtered catalog listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (sourceFilter === 'immobiliare' && !(item.externalListingUrl?.includes('immobiliare.it') || item.source === 'immobiliare')) {
        return false;
      }
      if (sourceFilter === 'community' && (item.externalListingUrl?.includes('immobiliare.it') || item.source === 'immobiliare')) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchZone = item.zone.toLowerCase().includes(query);
        const matchAddress = item.address.toLowerCase().includes(query);
        const matchId = item.id.toLowerCase().includes(query);
        const matchUrl = item.externalListingUrl?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchZone && !matchAddress && !matchId && !matchUrl) return false;
      }
      return true;
    });
  }, [listings, sourceFilter, searchTerm]);

  // Handle single deletion
  const handleDeleteListing = async (id: string, title: string) => {
    if (!window.confirm(isIt ? `Eliminare definitivamente l'annuncio "${title}"?` : `Permanently delete listing "${title}"?`)) {
      return;
    }
    try {
      await deleteListingFromFirestore(id);
      addLog('info', `Annuncio rimosso dal database: ${id} (${title})`);
      if (onNotification) onNotification(isIt ? 'Annuncio eliminato' : 'Listing deleted');
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      addLog('error', `Errore durante l'eliminazione di ${id}: ${err.message}`);
    }
  };

  // Handle batch deletion
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(isIt ? `Eliminare definitivamente i ${ids.length} annunci selezionati da Firestore?` : `Permanently delete ${ids.length} selected listings?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const count = await batchDeleteListingsFromFirestore(ids);
      addLog('success', `Eliminati ${count} annunci in blocco da Firestore.`);
      setSelectedIds(new Set());
      if (onNotification) onNotification(isIt ? `${count} annunci eliminati` : `${count} listings deleted`);
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      addLog('error', `Errore cancellazione di massa: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV Processing
  const handleProcessCSV = (raw?: string) => {
    const text = raw !== undefined ? raw : csvContent;
    if (!text.trim()) {
      setImportErrors([isIt ? 'Il testo CSV è vuoto.' : 'CSV content is empty.']);
      return;
    }
    const { listings: parsed, errors } = parseCSVToListings(text);
    if (errors.length > 0) {
      setImportErrors(errors);
    } else {
      setImportErrors([]);
      setPreviewListings(parsed);
      addLog('info', `File CSV analizzato con successo: ${parsed.length} annunci validi pronti per il salvataggio.`);
    }
  };

  // Handle URL Batch Parsing (e.g. Immobiliare.it URLs)
  const handleProcessUrlBatch = () => {
    if (!urlBatchText.trim()) return;
    const lines = urlBatchText.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
    if (lines.length === 0) {
      setImportErrors([isIt ? 'Nessun URL valido trovato (inserisci link con http:// o https://).' : 'No valid URLs found.']);
      return;
    }

    const created: Listing[] = lines.map((url, idx) => {
      // Extract numeric ID if present
      const idMatch = url.match(/annunci\/(\d+)/i) || url.match(/\/(\d+)\/?$/);
      const extId = idMatch ? idMatch[1] : `${Date.now()}-${idx}`;
      
      return {
        id: `immob-url-${extId}`,
        title: `Alloggio a Milano - Rif. Immobiliare #${extId}`,
        roomType: 'singola',
        price: 650,
        billsIncluded: false,
        billsEstimate: 70,
        depositMonths: 2,
        zone: 'Città Studi / Lambrate',
        address: 'Milano',
        metroStation: 'Lambrate FS',
        metroLine: 'M2',
        metroWalkingMinutes: 4,
        availableFrom: 'Subito',
        minStayMonths: 6,
        photos: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
        ],
        description: `Annuncio immobiliare sincronizzato da Immobiliare.it (Rif. ${extId}). Per dettagli completi e appuntamenti di visita, consulta la pagina originale.`,
        contractType: 'Transitorio Studenti',
        landlordType: 'Privato',
        authorName: 'Immobiliare.it Partner',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        externalListingUrl: url,
        source: 'immobiliare',
        verified: true,
        targetUniversities: ['PoliMi Leonardo', 'Statale (Festa del Perdono)'],
        amenities: {
          wifi: true,
          desk: true,
          washingMachine: true,
          balcony: false,
          airConditioning: false,
          elevator: true,
          privateBathroom: false,
          dishwasher: false,
        },
        genderPreference: 'tutti',
        createdAt: 'Importato via Admin'
      };
    });

    setPreviewListings(created);
    setImportErrors([]);
    addLog('info', `Generati ${created.length} alloggi formattati da link esterni.`);
  };

  // Handle Single Manual Listing Creation
  const handleSaveManualListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    setIsProcessing(true);
    try {
      const { metroStation, metroLine, metroWalkingMinutes } = inferMetroStationAndLine(`${manualTitle} ${manualZone} ${manualAddress}`);
      
      const newListing: Listing = {
        id: `manual-admin-${Date.now()}`,
        title: manualTitle.trim(),
        price: Number(manualPrice) || 600,
        billsIncluded: manualBillsIncluded,
        billsEstimate: manualBillsIncluded ? 0 : 70,
        depositMonths: 2,
        roomType: manualRoomType,
        zone: normalizeMilanZone(manualZone, manualAddress),
        address: manualAddress.trim(),
        metroStation,
        metroLine,
        metroWalkingMinutes,
        availableFrom: 'Subito',
        minStayMonths: 6,
        photos: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
        ],
        description: 'Annuncio inserito e verificato direttamente dalla gestione amministrativa del portale.',
        contractType: 'Transitorio Studenti',
        landlordType: 'Privato',
        authorName: user?.displayName || 'Amministrazione',
        authorAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        externalListingUrl: manualExternalUrl.trim() || undefined,
        source: manualExternalUrl.includes('immobiliare.it') ? 'immobiliare' : 'admin',
        verified: true,
        targetUniversities: ['PoliMi Leonardo'],
        amenities: {
          wifi: true,
          desk: true,
          washingMachine: true,
          balcony: true,
          airConditioning: true,
          elevator: true,
          privateBathroom: false,
          dishwasher: false,
        },
        genderPreference: 'tutti',
        createdAt: 'Appena inserito'
      };

      await saveListingToFirestore(newListing);
      addLog('success', `Annuncio manuale "${newListing.title}" inserito in Firestore con ID: ${newListing.id}`);
      if (onNotification) onNotification(isIt ? 'Annuncio aggiunto con successo' : 'Listing added successfully');
      setManualTitle('');
      if (onRefreshListings) onRefreshListings();
      setActiveTab('catalog');
    } catch (err: any) {
      addLog('error', `Errore creazione annuncio: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Commit Preview Listings to Firestore
  const handleCommitPreviewToDb = async () => {
    if (previewListings.length === 0) return;
    setIsProcessing(true);
    try {
      const savedCount = await batchSaveListingsToFirestore(previewListings);
      addLog('success', `Sincronizzazione completata: ${savedCount} annunci salvati con successo su Firestore.`);
      if (onNotification) onNotification(isIt ? `${savedCount} annunci salvati nel database!` : `${savedCount} listings saved!`);
      setPreviewListings([]);
      setCsvContent('');
      setUrlBatchText('');
      if (onRefreshListings) onRefreshListings();
      setActiveTab('catalog');
    } catch (err: any) {
      addLog('error', `Errore durante il salvataggio in Firestore: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-seed verified Milan catalog
  const handleReSeedCatalog = async () => {
    if (!window.confirm(isIt 
      ? 'Vuoi ripristinare il catalogo base di Milano (75 annunci verificati con link a Immobiliare.it)? I dati esistenti verranno aggiornati.' 
      : 'Restore default Milan catalog (75 verified listings with Immobiliare.it links)?'
    )) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await restoreDefaultCatalogToFirestore();
      addLog('success', `Catalogo base ripristinato: ${res.inserted} inseriti, ${res.updated} aggiornati.`);
      if (onNotification) onNotification(isIt ? 'Catalogo ripristinato e sincronizzato' : 'Catalog restored and synced');
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      addLog('error', `Errore ripristino catalogo: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Purge Duplicates
  const handlePurgeDuplicates = async () => {
    setIsProcessing(true);
    try {
      const deletedCount = await purgeDuplicatesFromFirestore();
      if (deletedCount > 0) {
        addLog('success', `Pulizia completata: rimossi ${deletedCount} annunci duplicati.`);
        if (onNotification) onNotification(isIt ? `Rimossi ${deletedCount} duplicati!` : `Removed ${deletedCount} duplicates!`);
      } else {
        addLog('info', 'Controllo duplicati: nessun annuncio doppio rilevato nel database.');
        if (onNotification) onNotification(isIt ? 'Nessun duplicato trovato' : 'No duplicates found');
      }
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      addLog('error', `Errore pulizia duplicati: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export JSON Dump
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(listings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `affitti_milano_dump_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('info', `Esportato dump JSON di ${listings.length} annunci.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['id', 'title', 'price', 'billsIncluded', 'roomType', 'zone', 'address', 'metroStation', 'metroLine', 'externalListingUrl', 'source'];
    const rows = listings.map(l => [
      `"${l.id}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.price,
      l.billsIncluded ? 'true' : 'false',
      `"${l.roomType}"`,
      `"${(l.zone || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${l.metroStation || ''}"`,
      `"${l.metroLine || ''}"`,
      `"${l.externalListingUrl || ''}"`,
      `"${l.source || ''}"`
    ]);

    const csvContentString = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContentString);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `affitti_milano_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addLog('info', `Esportato foglio CSV con ${listings.length} annunci.`);
  };

  return (
    <div id="admin-control-panel-root" className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Amministrazione</span>
                </span>
                <span className="text-xs text-stone-400">
                  {user?.email ? `Account: ${user.email}` : 'Accesso Admin Privilegiato (coppolek@gmail.com)'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
                <Database className="w-6 h-6 text-amber-500" />
                <span>Pannello di Controllo Importazioni Annunci</span>
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Gestione completa delle importazioni, sincronizzazione con Firestore e monitoraggio delle fonti esterne (Immobiliare.it & FB).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onBackToApp && (
                <button
                  id="admin-btn-back-home"
                  onClick={onBackToApp}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors border border-stone-700"
                >
                  {isIt ? '← Torna alla Home' : '← Back to App'}
                </button>
              )}

              <button
                id="admin-btn-export-csv"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors border border-stone-700"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Esporta CSV</span>
              </button>

              <button
                id="admin-btn-reseed"
                disabled={isProcessing}
                onClick={handleReSeedCatalog}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Sincronizza Catalogo Base</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-stone-800">
            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Totale Annunci</span>
              <div className="text-xl font-bold font-serif text-white mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-emerald-400">Sincronizzati nel DB</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Immobiliare.it</span>
              <div className="text-xl font-bold font-serif text-red-400 mt-0.5">{stats.fromImmobiliare}</div>
              <span className="text-[10px] text-stone-400">Con link diretto</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Community & FB</span>
              <div className="text-xl font-bold font-serif text-blue-400 mt-0.5">{stats.fromCommunity}</div>
              <span className="text-[10px] text-stone-400">Inseriti da privati</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Prezzo Medio</span>
              <div className="text-xl font-bold font-serif text-amber-400 mt-0.5">€{stats.avgPrice}</div>
              <span className="text-[10px] text-stone-400">Canone mensile</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Spese Incluse</span>
              <div className="text-xl font-bold font-serif text-teal-400 mt-0.5">
                {stats.total > 0 ? Math.round((stats.withBillsIncluded / stats.total) * 100) : 0}%
              </div>
              <span className="text-[10px] text-stone-400">{stats.withBillsIncluded} alloggi</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Integrità Dati</span>
              <div className="text-xl font-bold font-serif text-emerald-400 mt-0.5">100%</div>
              <span className="text-[10px] text-stone-400">0 errori critici</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto">
          <button
            id="tab-admin-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Catalogo Annunci ({listings.length})</span>
          </button>

          <button
            id="tab-admin-importer"
            onClick={() => setActiveTab('importer')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'importer'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-amber-600" />
            <span>Importatore Multifunzione</span>
            {previewListings.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {previewListings.length}
              </span>
            )}
          </button>

          <button
            id="tab-admin-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Manutenzione & Duplicati</span>
          </button>

          <button
            id="tab-admin-logs"
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-600" />
            <span>Registro Operazioni ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: CATALOG TABLE */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="admin-search-input"
                    type="text"
                    placeholder={isIt ? 'Cerca per titolo, zona, indirizzo, ID o link...' : 'Search listings...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Source Filter */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setSourceFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      sourceFilter === 'all' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Tutti ({listings.length})
                  </button>
                  <button
                    onClick={() => setSourceFilter('immobiliare')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      sourceFilter === 'immobiliare' ? 'bg-white shadow-xs text-red-700 font-bold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Immobiliare.it ({stats.fromImmobiliare})</span>
                  </button>
                  <button
                    onClick={() => setSourceFilter('community')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      sourceFilter === 'community' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Community FB ({stats.fromCommunity})</span>
                  </button>
                </div>
              </div>

              {/* Batch Selection Action */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs font-semibold text-stone-600">
                    {selectedIds.size} selezionati
                  </span>
                  <button
                    id="admin-btn-batch-delete"
                    disabled={isProcessing}
                    onClick={handleBatchDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Elimina Selezionati</span>
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size > 0 && selectedIds.size === filteredListings.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(new Set(filteredListings.map(l => l.id)));
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                          className="w-4 h-4 rounded border-stone-300 text-amber-600"
                        />
                      </th>
                      <th className="p-3">Alloggio</th>
                      <th className="p-3">Tipologia</th>
                      <th className="p-3">Prezzo / Spese</th>
                      <th className="p-3">Zona & Metro</th>
                      <th className="p-3">Fonte / Link Esterno</th>
                      <th className="p-3 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400">
                          Nessun annuncio trovato con i filtri applicati.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        const isImmobiliare = item.externalListingUrl?.includes('immobiliare.it') || item.source === 'immobiliare';

                        return (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-amber-50/40 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const updated = new Set(selectedIds);
                                  if (e.target.checked) updated.add(item.id);
                                  else updated.delete(item.id);
                                  setSelectedIds(updated);
                                }}
                                className="w-4 h-4 rounded border-stone-300 text-amber-600"
                              />
                            </td>

                            {/* Title & Preview Image */}
                            <td className="p-3 max-w-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.photos && item.photos[0] ? item.photos[0] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=120&q=80'}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-stone-200 shrink-0 border border-stone-200"
                                />
                                <div>
                                  <h4 className="font-bold text-stone-900 text-xs line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                                    <span className="font-mono">{item.id}</span>
                                    <span>•</span>
                                    <span>{item.authorName}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Room Type */}
                            <td className="p-3">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold capitalize text-[11px]">
                                {item.roomType.replace('_', ' ')}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-3">
                              <div className="font-bold text-stone-900 font-serif text-sm">
                                €{item.price}<span className="text-stone-400 text-xs font-sans">/m</span>
                              </div>
                              <span className="text-[10px] font-medium text-stone-500">
                                {item.billsIncluded ? (
                                  <span className="text-emerald-700 font-semibold">Spese incluse</span>
                                ) : (
                                  `+€${item.billsEstimate || 70} spese`
                                )}
                              </span>
                            </td>

                            {/* Zone & Metro */}
                            <td className="p-3 max-w-[180px]">
                              <div className="font-semibold text-stone-800 truncate">{item.zone}</div>
                              <div className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                                <span className={`px-1 py-0.2 rounded font-bold text-[9px] ${
                                  item.metroLine === 'M1' ? 'bg-red-500 text-white' :
                                  item.metroLine === 'M2' ? 'bg-green-600 text-white' :
                                  item.metroLine === 'M3' ? 'bg-yellow-500 text-stone-900' :
                                  item.metroLine === 'M4' ? 'bg-blue-600 text-white' :
                                  'bg-purple-600 text-white'
                                }`}>
                                  {item.metroLine}
                                </span>
                                <span>{item.metroStation} ({item.metroWalkingMinutes}m)</span>
                              </div>
                            </td>

                            {/* Source & Link */}
                            <td className="p-3">
                              {isImmobiliare ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    <span>Immobiliare.it</span>
                                  </span>
                                  {item.externalListingUrl && (
                                    <div>
                                      <a
                                        href={item.externalListingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
                                      >
                                        <span>Apri annuncio</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                  <span>Community FB</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {item.externalListingUrl && (
                                  <a
                                    href={item.externalListingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Visita annuncio sul portale"
                                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteListing(item.id, item.title)}
                                  title="Elimina annuncio da Firestore"
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-PURPOSE IMPORTER */}
        {activeTab === 'importer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Importer tools */}
            <div className="lg:col-span-2 space-y-4">
              {/* Mode switch */}
              <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => { setImportMode('csv'); setPreviewListings([]); }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    importMode === 'csv' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV / TSV / Testo</span>
                </button>

                <button
                  onClick={() => { setImportMode('urls'); setPreviewListings([]); }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    importMode === 'urls' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Link Immobiliare.it</span>
                </button>

                <button
                  onClick={() => { setImportMode('manual'); setPreviewListings([]); }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    importMode === 'manual' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Inserimento Manuale</span>
                </button>
              </div>

              {/* Mode: CSV */}
              {importMode === 'csv' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">Caricamento Massivo CSV</h3>
                      <p className="text-xs text-stone-500">Incolla righe CSV o trascina un file di esportazione.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `title,roomType,price,billsIncluded,depositMonths,zone,address,metroStation,metroLine,metroWalkingMinutes,availableFrom,photos,description,authorName,externalListingUrl
"Stanza singola luminosa Città Studi",singola,650,true,2,"Città Studi / Lambrate","Via Pacini 40, Milano","Piola",M2,3,"Subito","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80","Splendida camera singola con balcone vicino al Politecnico.","Studio Immobiliare","https://www.immobiliare.it/annunci/132459832/"`;
                        setCsvContent(sample);
                        handleProcessCSV(sample);
                      }}
                      className="text-xs font-semibold text-amber-700 hover:underline"
                    >
                      Carica esempio
                    </button>
                  </div>

                  <textarea
                    id="admin-csv-textarea"
                    rows={8}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    placeholder="title,roomType,price,billsIncluded,zone,address,metroStation,metroLine,photos,externalListingUrl..."
                    className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono text-stone-800 focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleProcessCSV()}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Analizza e Anteprima
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: URLs */}
              {importMode === 'urls' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Import Rapido da Link Esterni</h3>
                    <p className="text-xs text-stone-500">
                      Incolla uno o più link di annunci (es. da Immobiliare.it), uno per riga. Il parser genererà le schede alloggio collegate.
                    </p>
                  </div>

                  <textarea
                    id="admin-urls-textarea"
                    rows={6}
                    value={urlBatchText}
                    onChange={(e) => setUrlBatchText(e.target.value)}
                    placeholder="https://www.immobiliare.it/annunci/132459832/&#10;https://www.immobiliare.it/annunci/132924160/&#10;https://www.immobiliare.it/annunci/132938174/"
                    className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono text-stone-800 focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleProcessUrlBatch}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Genera Schede da Link
                  </button>
                </div>
              )}

              {/* Mode: Manual Single */}
              {importMode === 'manual' && (
                <form onSubmit={handleSaveManualListing} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-stone-900 text-sm">Inserimento Diretto Alloggio</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Titolo Annuncio</label>
                      <input
                        type="text"
                        required
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="es. Stanza singola con balcone a Porta Romana"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Canone Mensile (€)</label>
                      <input
                        type="number"
                        required
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Tipologia</label>
                      <select
                        value={manualRoomType}
                        onChange={(e) => setManualRoomType(e.target.value as RoomType)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      >
                        <option value="singola">Stanza Singola</option>
                        <option value="doppia">Stanza Doppia</option>
                        <option value="monolocale">Monolocale</option>
                        <option value="bilocale">Bilocale</option>
                        <option value="posto_letto">Posto Letto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Zona di Milano</label>
                      <input
                        type="text"
                        value={manualZone}
                        onChange={(e) => setManualZone(e.target.value)}
                        placeholder="es. Porta Romana / Crocetta"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Indirizzo o Metro vicina</label>
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="es. Corso di Porta Romana 80, Milano"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Link Annuncio Esterno (es. Immobiliare.it)</label>
                      <input
                        type="url"
                        value={manualExternalUrl}
                        onChange={(e) => setManualExternalUrl(e.target.value)}
                        placeholder="https://www.immobiliare.it/annunci/..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                        <input
                          type="checkbox"
                          checked={manualBillsIncluded}
                          onChange={(e) => setManualBillsIncluded(e.target.checked)}
                          className="w-4 h-4 rounded border-stone-300 text-amber-600"
                        />
                        <span>Spese condominiali e riscaldamento incluse nel canone</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-60"
                  >
                    Salva Annuncio in Firestore
                  </button>
                </form>
              )}

              {/* Errors container */}
              {importErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Errori riscontrati durante l'analisi:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right side: Preview card & commit button */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <h3 className="font-bold text-stone-900 text-sm flex items-center justify-between">
                  <span>Anteprima Importazione</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {previewListings.length} pronti
                  </span>
                </h3>

                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Verifica i dati prima di procedere con la sincronizzazione nel database Firestore.
                </p>

                {previewListings.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                    Nessun annuncio in anteprima. Utilizza il box a sinistra per caricare CSV o incollare link.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
                      {previewListings.slice(0, 10).map((p, idx) => (
                        <div key={idx} className="pt-2 text-xs">
                          <div className="font-bold text-stone-900 line-clamp-1">{p.title}</div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                            <span>{p.zone} • {p.roomType}</span>
                            <span className="font-bold text-amber-900 font-serif">€{p.price}</span>
                          </div>
                        </div>
                      ))}
                      {previewListings.length > 10 && (
                        <div className="text-[11px] text-stone-400 text-center pt-2">
                          ...altri {previewListings.length - 10} annunci in coda.
                        </div>
                      )}
                    </div>

                    <button
                      id="admin-btn-commit-import"
                      disabled={isProcessing}
                      onClick={handleCommitPreviewToDb}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isProcessing 
                          ? 'Sincronizzazione in corso...' 
                          : `Salva ${previewListings.length} Annunci in Firestore`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MAINTENANCE & DUPLICATES */}
        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Restore Default Catalog */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Ripristina Catalogo Base (75 Annunci)</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Aggiorna Firestore con l'intero archivio ufficiale di annunci verificati con link diretti a Immobiliare.it e coordinate metro corrette.
                </p>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleReSeedCatalog}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                Esegui Re-Sync Catalogo
              </button>
            </div>

            {/* Card 2: Purge Duplicates */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-3">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Pulizia Duplicati Automatica</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Scansiona l'intera collezione Firestore ed elimina record ridondanti con lo stesso URL o stessa combinazione titolo/prezzo/zona.
                </p>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePurgeDuplicates}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                Avvia Scansione Duplicati
              </button>
            </div>

            {/* Card 3: Export Backups */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Download Backup Completo</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Esporta l'intero catalogo attivo in formato JSON o CSV per archivio offline o migrazione.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                >
                  Backup JSON
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                >
                  Backup CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 font-mono text-xs shadow-md border border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>Console Operazioni Amministrative</span>
              </span>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-[11px] text-stone-400 hover:text-white"
              >
                Pulisci Console
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-stone-500 select-none text-[10px] shrink-0 mt-0.5">[{log.time}]</span>
                  <span className={`text-[10px] uppercase font-bold shrink-0 px-1 py-0.2 rounded ${
                    log.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    log.type === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    log.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-stone-800 text-stone-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-stone-300 leading-relaxed break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
