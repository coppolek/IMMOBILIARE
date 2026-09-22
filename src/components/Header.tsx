import React from 'react';
import { 
  Building2, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  Plus, 
  ExternalLink,
  Users,
  ShieldCheck,
  Globe2,
  UploadCloud,
  LogIn,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { FACEBOOK_GROUP_URL } from '../data/milanData';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'listings' | 'seekers' | 'generator' | 'scamDetector' | 'zones';
  setActiveTab: (tab: 'listings' | 'seekers' | 'generator' | 'scamDetector' | 'zones') => void;
  onOpenAddListing: () => void;
  onOpenAddSeeker: () => void;
  onOpenImport?: () => void;
  lang: 'it' | 'en';
  setLang: (lang: 'it' | 'en') => void;
  dbConnected?: boolean;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddListing,
  onOpenAddSeeker,
  onOpenImport,
  lang,
  setLang,
  dbConnected = true,
  user,
  onOpenAuth,
  onOpenProfile,
}) => {
  const isIt = lang === 'it';

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Notification Bar: Official Facebook Group Connection */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-stone-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-400/30 text-[11px]">
              <Users className="w-3 h-3 text-amber-400" />
              Gruppo Facebook 477013955229676
            </span>
            <span className="hidden sm:inline text-stone-300">
              {isIt ? 'Community ufficiale per alloggi studenti, stanze e appartamenti a Milano' : 'Official community for student housing, rooms & apartments in Milan'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              id="header-facebook-group-btn"
              href={FACEBOOK_GROUP_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              <span>{isIt ? 'Apri Gruppo su Facebook' : 'Open Facebook Group'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Live Database status pill */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-[11px] text-stone-300">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden lg:inline">{isIt ? 'Database Cloud' : 'Cloud DB'}</span>
              <span className="text-emerald-300 font-semibold">{dbConnected ? (isIt ? 'Sincronizzato' : 'Connected') : (isIt ? 'Connessione...' : 'Connecting...')}</span>
            </div>

            <div className="h-3.5 w-px bg-stone-700 hidden sm:block" />

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(isIt ? 'en' : 'it')}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors text-[11px]"
              title="Cambia lingua / Switch language"
            >
              <Globe2 className="w-3 h-3 text-stone-400" />
              <span className="font-semibold">{isIt ? 'IT' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('listings')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 font-bold text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 font-serif">
                  Affitti Milano
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Housing Hub
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Stanze, Monolocali & Coinquilini • Milano e Hinterland
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200/80">
            <button
              id="nav-tab-listings"
              onClick={() => setActiveTab('listings')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'listings'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              {isIt ? 'Annunci Alloggi' : 'Rooms & Flats'}
            </button>

            <button
              id="nav-tab-seekers"
              onClick={() => setActiveTab('seekers')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'seekers'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-sky-600" />
              {isIt ? 'Chi Cerca Casa' : 'Seeker Board'}
            </button>

            <button
              id="nav-tab-generator"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {isIt ? 'Formatta Post FB' : 'AI Post Generator'}
            </button>

            <button
              id="nav-tab-scam-shield"
              onClick={() => setActiveTab('scamDetector')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'scamDetector'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              {isIt ? 'AI Anti-Truffa' : 'Scam Shield'}
            </button>

            <button
              id="nav-tab-zones"
              onClick={() => setActiveTab('zones')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'zones'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/70 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {isIt ? 'Zone & Prezzi' : 'Zones & Metro'}
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenImport && (
              <button
                id="btn-import-header"
                onClick={onOpenImport}
                title={isIt ? 'Importa alloggi da CSV o RSS' : 'Import listings from CSV or RSS'}
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-amber-600" />
                <span className="hidden lg:inline">{isIt ? 'Importa CSV/RSS' : 'Import'}</span>
              </button>
            )}

            <button
              id="btn-add-listing-header"
              onClick={onOpenAddListing}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isIt ? 'Offro Stanza' : 'Post Listing'}</span>
              <span className="sm:hidden">{isIt ? 'Offro' : 'Post'}</span>
            </button>

            <button
              id="btn-add-seeker-header"
              onClick={onOpenAddSeeker}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{isIt ? 'Cerco Stanza' : 'I am seeking'}</span>
              <span className="sm:hidden">{isIt ? 'Cerco' : 'Seek'}</span>
            </button>

            <div className="h-6 w-px bg-stone-200 mx-0.5 hidden sm:block" />

            {/* User Profile / Auth Action */}
            {user ? (
              <button
                id="header-user-profile-btn"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                title={isIt ? 'Gestisci profilo' : 'Manage profile'}
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  alt={user.displayName || 'Profile'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover bg-stone-200 border border-amber-500/40"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-stone-900 leading-tight truncate max-w-[85px]">
                    {user.displayName || user.email?.split('@')[0] || 'Utente'}
                  </span>
                  <span className="text-[9px] font-medium text-amber-700 capitalize">
                    {user.role === 'student' ? (isIt ? 'Studente' : 'Student') : user.role === 'landlord' ? (isIt ? 'Proprietario' : 'Landlord') : (isIt ? 'Lavoratore' : 'Worker')}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-600" />
                  <span>{isIt ? 'Accedi' : 'Log In'}</span>
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">{isIt ? 'Registrati' : 'Sign Up'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden py-2 border-t border-stone-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'listings' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600'
            }`}
          >
            {isIt ? 'Annunci' : 'Listings'}
          </button>
          <button
            onClick={() => setActiveTab('seekers')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'seekers' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600'
            }`}
          >
            {isIt ? 'Cercano' : 'Seekers'}
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'generator' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600'
            }`}
          >
            {isIt ? 'Genera Post' : 'Post AI'}
          </button>
          <button
            onClick={() => setActiveTab('scamDetector')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'scamDetector' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600'
            }`}
          >
            {isIt ? 'Anti-Truffa' : 'Scam Shield'}
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'zones' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600'
            }`}
          >
            {isIt ? 'Zone & Prezzi' : 'Zones'}
          </button>
        </div>
      </div>
    </header>
  );
};
