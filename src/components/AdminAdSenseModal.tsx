import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  Check, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Eye, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Copy,
  Link2
} from 'lucide-react';
import { AdSenseConfig, AdSenseBanner, AdBannerPosition, AdBannerType } from '../types';
import { getDefaultAdSenseConfig } from '../services/dbService';
import { AdBanner } from './AdBanner';

interface AdminAdSenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdSenseConfig;
  onSaveConfig: (newConfig: AdSenseConfig) => Promise<void>;
  lang: 'it' | 'en';
  userEmail?: string | null;
}

export const AdminAdSenseModal: React.FC<AdminAdSenseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  lang,
  userEmail,
}) => {
  const isIt = lang === 'it';

  // Form State
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [publisherId, setPublisherId] = useState(config.publisherId || 'ca-pub-5738943819550045');
  const [testMode, setTestMode] = useState(config.testMode ?? false);
  const [banners, setBanners] = useState<AdSenseBanner[]>(
    config.banners && config.banners.length > 0
      ? config.banners
      : getDefaultAdSenseConfig().banners
  );

  const [activeTab, setActiveTab] = useState<'placements' | 'settings' | 'preview' | 'guide'>('placements');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  // Official Script Code requested by user
  const officialAdSenseScript = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId.trim() || 'ca-pub-5738943819550045'}"\n     crossorigin="anonymous"></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(officialAdSenseScript);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  // Handlers for banner modification
  const handleToggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleUpdateBanner = (id: string, field: keyof AdSenseBanner, value: any) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleDeleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Specific add functions for each banner type
  const handleAddBannerWithType = (type: AdBannerType) => {
    const newId = `banner-${type}-${Date.now()}`;
    let newBanner: AdSenseBanner;

    if (type === 'image') {
      newBanner = {
        id: newId,
        name: isIt ? 'Banner Immagine Sponsor' : 'Image Sponsor Banner',
        type: 'image',
        position: 'feed',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=728&q=80',
        targetUrl: 'https://facebook.com/groups/477013955229676/',
        imageAlt: 'Sponsor Affitti Milano',
        badgeText: 'Sponsor Ufficiale',
        openInNewTab: true,
        active: true,
      };
    } else if (type === 'text') {
      newBanner = {
        id: newId,
        name: isIt ? 'Banner Testuale Partner' : 'Text Partner Ad',
        type: 'text',
        position: 'feed',
        title: isIt ? 'Traslochi & Deposito Bagagli Studenti a Milano' : 'Student Relocation & Storage in Milan',
        description: isIt ? 'Servizio convenzionato con sconti fino al 20% per gli iscritti alla Community Affitti Milano. Preventivo rapido online.' : 'Affiliated service with special student discounts.',
        ctaText: isIt ? 'Richiedi Sconto →' : 'Get Discount →',
        targetUrl: 'https://facebook.com/groups/477013955229676/',
        badgeText: 'Partner Convenzionato',
        openInNewTab: true,
        active: true,
      };
    } else if (type === 'code') {
      newBanner = {
        id: newId,
        name: isIt ? 'Banner Codice HTML / Script' : 'Custom HTML / Script Ad',
        type: 'code',
        position: 'header',
        customSnippet: `<div style="background:#fff;border:1px solid #e7e5e4;border-radius:1rem;padding:12px;text-align:center;">\n  <span style="font-size:10px;text-transform:uppercase;color:#ea580c;font-weight:bold;display:block;">Sponsorizzato</span>\n  <a href="https://facebook.com/groups/477013955229676/" target="_blank" style="color:#0f172a;font-weight:bold;text-decoration:none;font-size:13px;">\n    🏠 Unisciti al Gruppo Ufficiale Affitti Milano su Facebook →\n  </a>\n</div>`,
        active: true,
      };
    } else {
      // Default AdSense
      newBanner = {
        id: newId,
        name: isIt ? 'Nuovo Slot Google AdSense' : 'New Google AdSense Slot',
        type: 'adsense',
        position: 'custom',
        slotId: '1234567890',
        format: 'auto',
        responsive: true,
        active: true,
      };
    }

    setBanners((prev) => [newBanner, ...prev]);
  };

  const handleResetToDefaults = () => {
    if (window.confirm(isIt ? 'Ripristinare la configurazione predefinita dei banner?' : 'Reset to default banners config?')) {
      const def = getDefaultAdSenseConfig();
      setEnabled(def.enabled);
      setPublisherId(def.publisherId);
      setTestMode(def.testMode);
      setBanners(def.banners);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig: AdSenseConfig = {
        enabled,
        publisherId: publisherId.trim() || 'ca-pub-5738943819550045',
        testMode,
        banners,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'admin',
      };
      await onSaveConfig(updatedConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving AdSense config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const liveConfigForPreview: AdSenseConfig = {
    enabled,
    publisherId: publisherId.trim() || 'ca-pub-5738943819550045',
    testMode: true,
    banners,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="admin-adsense-modal"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-4xl w-full overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 px-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-stone-100">
                  {isIt ? 'Gestione Banner & Sponsor (Admin)' : 'Banners & Sponsor Management'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {isIt ? 'Amministrazione' : 'Admin'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isIt 
                  ? 'Configura Google AdSense, banner in codice HTML/Script, immagini con link e annunci solo testo' 
                  : 'Manage AdSense, custom HTML/JS code snippets, image banners with links, and text sponsor cards'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-adsense-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Master Toggles Bar */}
        <div className="bg-amber-50/60 border-b border-amber-200/60 p-4 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Master Switch */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  enabled ? 'bg-amber-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {isIt ? 'Spazi Banner Attivi' : 'Banners Active'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {enabled ? (isIt ? 'Visibili sul portale' : 'Shown on portal') : (isIt ? 'Disattivati tutti' : 'All disabled')}
                </span>
              </div>
            </div>

            {/* Test Mode Switch */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTestMode(!testMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  testMode ? 'bg-sky-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    testMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {isIt ? 'Modalità Anteprima / Sandbox' : 'Sandbox Preview Mode'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {testMode ? (isIt ? 'Riquadri di prova' : 'Visual placeholders') : (isIt ? 'Live (Annunci reali)' : 'Live Ads')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1 font-semibold bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{banners.filter(b => b.active).length} / {banners.length} {isIt ? 'banner attivi' : 'active banners'}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-200 bg-stone-50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('placements')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'placements'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>{isIt ? 'Gestione Banner' : 'All Banners'}</span>
            <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded-full font-mono">{banners.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isIt ? 'Script AdSense & Publisher' : 'AdSense Script & Tags'}</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isIt ? 'Anteprima Live' : 'Live Preview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isIt ? 'Guida & Suggerimenti' : 'Guide'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: Banner Placements & Add Buttons */}
          {activeTab === 'placements' && (
            <div className="space-y-5">
              {/* Add New Banner Actions Toolbar */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {isIt ? 'Aggiungi Nuovo Banner / Sponsor:' : 'Add New Banner / Sponsor:'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isIt ? 'Scegli il formato che desideri inserire:' : 'Choose the format you want to insert:'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Add Image Banner */}
                  <button
                    id="btn-add-image-banner"
                    type="button"
                    onClick={() => handleAddBannerWithType('image')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isIt ? '+ Immagine con Link' : '+ Image + Link'}</span>
                  </button>

                  {/* Add Text Banner */}
                  <button
                    id="btn-add-text-banner"
                    type="button"
                    onClick={() => handleAddBannerWithType('text')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isIt ? '+ Solo Testo con Link' : '+ Text + Link'}</span>
                  </button>

                  {/* Add Code Banner */}
                  <button
                    id="btn-add-code-banner"
                    type="button"
                    onClick={() => handleAddBannerWithType('code')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{isIt ? '+ Codice HTML / Script' : '+ HTML / Code'}</span>
                  </button>

                  {/* Add AdSense Banner */}
                  <button
                    id="btn-add-adsense-banner"
                    type="button"
                    onClick={() => handleAddBannerWithType('adsense')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-600 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isIt ? '+ Google AdSense' : '+ Google AdSense'}</span>
                  </button>
                </div>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 gap-4">
                {banners.map((b) => {
                  const bType = b.type || (b.customSnippet ? 'code' : 'adsense');

                  return (
                    <div
                      key={b.id}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                        b.active 
                          ? 'border-stone-300 bg-white shadow-xs' 
                          : 'border-stone-200 bg-stone-50/70 opacity-75'
                      }`}
                    >
                      {/* Banner Header & Type Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={b.active}
                            onChange={() => handleToggleBanner(b.id)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-stone-900">
                                {b.name}
                              </span>

                              {/* Type Badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                bType === 'image'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : bType === 'text'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : bType === 'code'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {bType === 'image' && '🖼️ Immagine + Link'}
                                {bType === 'text' && '📝 Solo Testo + Link'}
                                {bType === 'code' && '💻 Codice HTML / JS'}
                                {bType === 'adsense' && '🟡 Google AdSense'}
                              </span>

                              {/* Position Badge */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                                {b.position}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(b.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
                            title={isIt ? 'Elimina banner' : 'Delete banner'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{isIt ? 'Elimina' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Settings Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {isIt ? 'Nome Identificativo' : 'Banner Name'}
                          </label>
                          <input
                            type="text"
                            value={b.name}
                            onChange={(e) => handleUpdateBanner(b.id, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {isIt ? 'Tipo Banner' : 'Banner Type'}
                          </label>
                          <select
                            value={bType}
                            onChange={(e) => handleUpdateBanner(b.id, 'type', e.target.value as AdBannerType)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500 font-semibold"
                          >
                            <option value="adsense">Google AdSense (Slot Ufficiale)</option>
                            <option value="code">Codice HTML / Script / Widget</option>
                            <option value="image">Immagine con Link</option>
                            <option value="text">Solo Testo con Link</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            {isIt ? 'Posizione sul Sito' : 'Site Position'}
                          </label>
                          <select
                            value={b.position}
                            onChange={(e) => handleUpdateBanner(b.id, 'position', e.target.value as AdBannerPosition)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
                          >
                            <option value="header">Header Leaderboard (In Alto)</option>
                            <option value="feed">In-Feed (Tra gli Alloggi)</option>
                            <option value="listing_modal">Scheda Alloggio (Pop-up Dettagli)</option>
                            <option value="footer">Fondo Pagina (Sopra Footer)</option>
                            <option value="custom">Posizione Personalizzata</option>
                          </select>
                        </div>
                      </div>

                      {/* CONDITIONAL SECTION: TYPE SPECIFIC FIELDS */}
                      
                      {/* A) GOOGLE ADSENSE SPECIFIC FIELDS */}
                      {bType === 'adsense' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-stone-100 bg-amber-50/40 p-3 rounded-xl">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Ad Slot ID (<code className="font-mono text-[10px]">data-ad-slot</code>)
                            </label>
                            <input
                              type="text"
                              placeholder="es. 1092837465"
                              value={b.slotId || ''}
                              onChange={(e) => handleUpdateBanner(b.id, 'slotId', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-amber-500"
                            />
                            <p className="text-[10px] text-stone-500 mt-1">
                              {isIt ? 'Codice numerico generato dal tuo pannello Google AdSense' : 'Numeric ID from Google AdSense'}
                            </p>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              {isIt ? 'Formato / Dimensioni' : 'Format'}
                            </label>
                            <select
                              value={b.format || 'auto'}
                              onChange={(e) => handleUpdateBanner(b.id, 'format', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-amber-500"
                            >
                              <option value="auto">Auto (Responsive AdSense)</option>
                              <option value="horizontal">Horizontal (Leaderboard 728x90)</option>
                              <option value="rectangle">Rectangle (Card 336x280 / 300x250)</option>
                              <option value="vertical">Vertical (Skyscraper 160x600)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* B) IMMAGINE CON LINK SPECIFIC FIELDS */}
                      {bType === 'image' && (
                        <div className="space-y-3 pt-3 mt-3 border-t border-stone-100 bg-blue-50/40 p-3 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'URL Immagine Banner (JPG, PNG, WebP, GIF)' : 'Banner Image URL'}
                              </label>
                              <input
                                type="url"
                                placeholder="https://example.com/banner-sponsor.jpg"
                                value={b.imageUrl || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'imageUrl', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Link di Destinazione al Click (URL)' : 'Destination Click Link (URL)'}
                              </label>
                              <input
                                type="url"
                                placeholder="https://sito-partner.it/offerta-studenti"
                                value={b.targetUrl || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'targetUrl', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Testo Alternativo (Alt Text)' : 'Image Alt Text'}
                              </label>
                              <input
                                type="text"
                                placeholder="es. Sponsor Ufficiale Traslochi"
                                value={b.imageAlt || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'imageAlt', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Etichetta / Badge Sponsor' : 'Badge Label'}
                              </label>
                              <input
                                type="text"
                                placeholder="es. Sponsor Ufficiale"
                                value={b.badgeText || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'badgeText', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-blue-500"
                              />
                            </div>

                            <div className="flex items-center pt-5">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-semibold select-none">
                                <input
                                  type="checkbox"
                                  checked={b.openInNewTab !== false}
                                  onChange={(e) => handleUpdateBanner(b.id, 'openInNewTab', e.target.checked)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{isIt ? 'Apri in nuova scheda (_blank)' : 'Open in new tab'}</span>
                              </label>
                            </div>
                          </div>

                          {/* Image preview */}
                          {b.imageUrl && (
                            <div className="pt-2">
                              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                                {isIt ? 'Anteprima Immagine:' : 'Image Preview:'}
                              </span>
                              <div className="max-w-md rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                                <img
                                  src={b.imageUrl}
                                  alt="Preview"
                                  className="w-full h-24 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* C) SOLO TESTO CON LINK SPECIFIC FIELDS */}
                      {bType === 'text' && (
                        <div className="space-y-3 pt-3 mt-3 border-t border-stone-100 bg-emerald-50/40 p-3 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Titolo Annuncio / Slogan' : 'Headline Title'}
                              </label>
                              <input
                                type="text"
                                placeholder="es. Cerchi un furgone per il trasloco a Milano?"
                                value={b.title || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-medium focus:outline-hidden focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Link di Destinazione (URL)' : 'Destination Link (URL)'}
                              </label>
                              <input
                                type="url"
                                placeholder="https://partner.it/offerta"
                                value={b.targetUrl || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'targetUrl', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              {isIt ? 'Descrizione Offerta / Servizio' : 'Description / Offer details'}
                            </label>
                            <textarea
                              rows={2}
                              placeholder="es. Sconto esclusivo del 15% per gli iscritti al gruppo Facebook Affitti Milano. Prenota comodamente online con codice promo."
                              value={b.description || ''}
                              onChange={(e) => handleUpdateBanner(b.id, 'description', e.target.value)}
                              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Testo Bottone (Call to Action)' : 'Button CTA Text'}
                              </label>
                              <input
                                type="text"
                                placeholder="es. Scopri l'offerta →"
                                value={b.ctaText || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'ctaText', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                {isIt ? 'Badge' : 'Badge'}
                              </label>
                              <input
                                type="text"
                                placeholder="es. Partner Convenzionato"
                                value={b.badgeText || ''}
                                onChange={(e) => handleUpdateBanner(b.id, 'badgeText', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-emerald-500"
                              />
                            </div>

                            <div className="flex items-center pt-5">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-semibold select-none">
                                <input
                                  type="checkbox"
                                  checked={b.openInNewTab !== false}
                                  onChange={(e) => handleUpdateBanner(b.id, 'openInNewTab', e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{isIt ? 'Apri in nuova scheda' : 'Open in new tab'}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* D) CODICE HTML / SCRIPT SPECIFIC FIELDS */}
                      {bType === 'code' && (
                        <div className="space-y-2 pt-3 mt-3 border-t border-stone-100 bg-purple-50/40 p-3 rounded-xl">
                          <label className="block text-[11px] font-semibold text-purple-900">
                            {isIt ? 'Codice HTML / Tag Script / iFrame / Widget:' : 'HTML Code / Script Tag / iFrame:'}
                          </label>
                          <textarea
                            rows={4}
                            placeholder={isIt ? 'Incolla qui qualsiasi tag <script>, <ins>, <iframe>, codice HTML o banner di affiliazione...' : 'Paste custom HTML, <script>, or iframe code here...'}
                            value={b.customSnippet || ''}
                            onChange={(e) => handleUpdateBanner(b.id, 'customSnippet', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-purple-200 bg-white font-mono text-[11px] text-stone-800 focus:outline-hidden focus:border-purple-500"
                          />
                          <p className="text-[10px] text-purple-700">
                            {isIt 
                              ? 'Gli script e il codice inserito verranno eseguiti e renderizzati in modo sicuro all\'interno dello slot specificato.' 
                              : 'HTML/JS will be rendered inside this banner position.'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Publisher & Script AdSense */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              {/* Publisher ID Input */}
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Google AdSense Publisher ID (<code className="font-mono text-amber-700">ca-pub-XXXXXXXXXXXXXXXX</code>)
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-5738943819550045"
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  {isIt 
                    ? 'Il tuo ID Publisher ufficiale Google AdSense configurato per Affitti Milano.' 
                    : 'Your official Google AdSense publisher client ID.'}
                </p>
              </div>

              {/* Official Script Box with Copy button */}
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {isIt ? 'Codice Ufficiale Google AdSense Inserito nel Sito:' : 'Official AdSense Script Tag Loaded:'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isIt ? 'Copiato!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isIt ? 'Copia Codice' : 'Copy Code'}</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-stone-950 font-mono text-xs text-emerald-400 overflow-x-auto select-all border border-stone-800">
                  {officialAdSenseScript}
                </pre>

                <p className="text-[11px] text-stone-400">
                  {isIt 
                    ? 'Questo tag è caricato globalmente nell\'intestazione (<head>) del sito con caricamento asincrono non bloccante.' 
                    : 'This tag is loaded globally in the <head> of the website with non-blocking async execution.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{isIt ? 'Caratteristiche dell\'Integrazione Pubblicitaria' : 'Advertising System Features'}</span>
                </div>
                <ul className="text-xs text-amber-900/90 space-y-1.5 list-disc list-inside">
                  <li><strong>Google AdSense:</strong> Tag ufficiali <code>&lt;ins class="adsbygoogle"&gt;</code> responsive sincronizzati con il client <code>{publisherId}</code>.</li>
                  <li><strong>Banner in Codice:</strong> Supporto per script JS, iframe di affiliazione, widget meteo o box HTML arbitrari.</li>
                  <li><strong>Immagini con Link:</strong> Ideale per sponsor diretti, agenzie partner, promozioni universitari o grafiche sponsorizzate con click tracciabile.</li>
                  <li><strong>Annunci Solo Testo:</strong> Box nativi non invasivi con titolo, testo promozionale, badge sponsor e pulsante Call To Action personalizzato.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span>{isIt ? 'Anteprima interattiva dei banner configurati:' : 'Interactive preview of configured banners:'}</span>
                <span className="font-semibold text-stone-800">
                  {testMode ? (isIt ? 'Modalità: Segnaposto / Preview' : 'Mode: Preview') : (isIt ? 'Modalità: Live' : 'Mode: Live')}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    1. Posizione Header Leaderboard (In Alto)
                  </h4>
                  <AdBanner position="header" config={liveConfigForPreview} isAdmin={true} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    2. Posizione In-Feed (Tra gli Alloggi)
                  </h4>
                  <AdBanner position="feed" config={liveConfigForPreview} isAdmin={true} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    3. Posizione Scheda Dettaglio Alloggio
                  </h4>
                  <AdBanner position="listing_modal" config={liveConfigForPreview} isAdmin={true} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    4. Posizione Fondo Pagina (Sopra Footer)
                  </h4>
                  <AdBanner position="footer" config={liveConfigForPreview} isAdmin={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 max-w-2xl text-xs text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isIt ? 'Guida Gestione Pubblicità & Monetizzazione' : 'Advertising & Monetization Guide'}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {isIt 
                    ? 'Puoi combinare sia annunci automatici Google AdSense che banner sponsor diretti (immagini, codice o testo) per massimizzare la resa.' 
                    : 'Combine AdSense with direct sponsors to maximize revenue.'}
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside bg-white p-5 rounded-2xl border border-stone-200">
                <li>
                  <span className="font-bold text-stone-900">{isIt ? 'Codice Google AdSense' : 'Google AdSense Code'}</span>
                  <p className="text-stone-500 pl-4 mt-0.5">
                    Il tag <code>ca-pub-5738943819550045</code> è già caricato in automatico nel codice sorgente del sito.
                  </p>
                </li>
                <li>
                  <span className="font-bold text-stone-900">{isIt ? 'Banner Immagine con Link' : 'Image Banner with Link'}</span>
                  <p className="text-stone-500 pl-4 mt-0.5">
                    Clicca su <strong>+ Immagine con Link</strong> per inserire un'immagine grafica di uno sponsor locale (agenzia, trasporti, corsi) con il relativo link di reindirizzamento.
                  </p>
                </li>
                <li>
                  <span className="font-bold text-stone-900">{isIt ? 'Banner Solo Testo con Link' : 'Text Banner with Link'}</span>
                  <p className="text-stone-500 pl-4 mt-0.5">
                    Ideale per annunci editoriali o consigli della community con titolo accattivante, descrizione del servizio e pulsante Call-to-Action.
                  </p>
                </li>
                <li>
                  <span className="font-bold text-stone-900">{isIt ? 'Banner Codice HTML / Script' : 'Code Banner'}</span>
                  <p className="text-stone-500 pl-4 mt-0.5">
                    Permette di incollare tag JavaScript complessi, iframe, widget di terze parti o pixel di affiliazione.
                  </p>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isIt ? 'Ripristina Predefiniti' : 'Reset Defaults'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              {isIt ? 'Chiudi' : 'Close'}
            </button>

            <button
              id="btn-save-adsense-settings"
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-md disabled:opacity-60"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isIt ? 'Configurazione Salvata nel Cloud!' : 'Saved to Cloud DB!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? (isIt ? 'Salvataggio...' : 'Saving...') : (isIt ? 'Salva Configurazione' : 'Save Settings')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
