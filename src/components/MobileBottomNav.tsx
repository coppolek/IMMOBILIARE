import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  User, 
  ShieldCheck, 
  LogIn,
  X,
  Home,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { isUserAdmin } from '../services/authService';

interface MobileBottomNavProps {
  activeTab: 'listings' | 'seekers' | 'zones';
  setActiveTab: (tab: 'listings' | 'seekers' | 'zones') => void;
  onOpenAddListing: () => void;
  onOpenAddSeeker: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenAdminPanel?: () => void;
  isAdminPanelOpen?: boolean;
  user: UserProfile | null;
  listingsCount?: number;
  lang: 'it' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddListing,
  onOpenAddSeeker,
  onOpenAuth,
  onOpenProfile,
  onOpenAdminPanel,
  isAdminPanelOpen = false,
  user,
  listingsCount,
  lang,
}) => {
  const isIt = lang === 'it';
  const isAdmin = isUserAdmin(user);
  const [showPostActionSheet, setShowPostActionSheet] = useState(false);

  return (
    <>
      {/* Mobile Post Quick Action Sheet (Modal Drawer) */}
      {showPostActionSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end md:hidden animate-in fade-in duration-150"
          onClick={() => setShowPostActionSheet(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-serif text-base text-stone-900">
                  {isIt ? 'Cosa vuoi pubblicare?' : 'What do you want to post?'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isIt ? 'Condividi la tua richiesta o il tuo alloggio a Milano' : 'Share your request or accommodation in Milan'}
                </p>
              </div>
              <button 
                onClick={() => setShowPostActionSheet(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                id="mobile-sheet-offer-room-btn"
                onClick={() => {
                  setShowPostActionSheet(false);
                  onOpenAddListing();
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-all shadow-xs text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-950">
                    {isIt ? 'Offro una Stanza / Alloggio' : 'Post a Room / Apartment'}
                  </div>
                  <div className="text-[11px] text-stone-800 font-medium">
                    {isIt ? 'Stanza singola, doppia o monolocale' : 'Single, double room or studio flat'}
                  </div>
                </div>
              </button>

              <button
                id="mobile-sheet-seek-room-btn"
                onClick={() => {
                  setShowPostActionSheet(false);
                  onOpenAddSeeker();
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold transition-all border border-stone-200 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {isIt ? 'Cerco Casa (Profilo Inquilino)' : 'I am Seeking Housing'}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {isIt ? 'Presentati ai proprietari con budget e università' : 'Introduce yourself with budget & university'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-bar"
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)]"
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {/* 1. Alloggi / Listings */}
          <button
            id="mobile-tab-listings"
            onClick={() => setActiveTab('listings')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              !isAdminPanelOpen && activeTab === 'listings'
                ? 'text-amber-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Building2 className={`w-5 h-5 ${!isAdminPanelOpen && activeTab === 'listings' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              {typeof listingsCount === 'number' && listingsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-amber-600 text-white rounded-full leading-tight">
                  {listingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {isIt ? 'Annunci' : 'Listings'}
            </span>
          </button>

          {/* 2. Chi Cerca / Seekers */}
          <button
            id="mobile-tab-seekers"
            onClick={() => setActiveTab('seekers')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              !isAdminPanelOpen && activeTab === 'seekers'
                ? 'text-amber-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className={`w-5 h-5 ${!isAdminPanelOpen && activeTab === 'seekers' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {isIt ? 'Cercano' : 'Seekers'}
            </span>
          </button>

          {/* 3. Central Action: + Pubblica */}
          <button
            id="mobile-tab-publish-action"
            onClick={() => setShowPostActionSheet(true)}
            className="flex flex-col items-center justify-center -mt-3 group"
            title={isIt ? 'Pubblica annuncio o cerca casa' : 'Post listing or seeker'}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-600/30 group-active:scale-95 transition-transform border-2 border-white">
              <Plus className="w-6 h-6 stroke-[2.5px] text-white" />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-amber-700">
              {isIt ? 'Pubblica' : 'Post'}
            </span>
          </button>

          {/* 4. Zone & Metro */}
          <button
            id="mobile-tab-zones"
            onClick={() => setActiveTab('zones')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              !isAdminPanelOpen && activeTab === 'zones'
                ? 'text-amber-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className={`w-5 h-5 ${!isAdminPanelOpen && activeTab === 'zones' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {isIt ? 'Zone' : 'Zones'}
            </span>
          </button>

          {/* 5. Profile or Admin */}
          {isAdmin && onOpenAdminPanel ? (
            <button
              id="mobile-tab-admin"
              onClick={onOpenAdminPanel}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
                isAdminPanelOpen
                  ? 'text-amber-600 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <ShieldCheck className={`w-5 h-5 ${isAdminPanelOpen ? 'text-amber-600 stroke-[2.5px]' : 'text-amber-500 stroke-[2px]'}`} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold text-amber-600">
                Admin
              </span>
            </button>
          ) : user ? (
            <button
              id="mobile-tab-profile"
              onClick={onOpenProfile}
              className="flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all text-stone-600 hover:text-stone-900"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                alt={user.displayName || 'Profile'}
                className="w-5 h-5 rounded-full object-cover border border-amber-500"
              />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[50px]">
                {user.displayName?.split(' ')[0] || (isIt ? 'Profilo' : 'Profile')}
              </span>
            </button>
          ) : (
            <button
              id="mobile-tab-login"
              onClick={() => onOpenAuth('login')}
              className="flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all text-stone-500 hover:text-stone-800"
            >
              <LogIn className="w-5 h-5 stroke-[1.75px]" />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {isIt ? 'Accedi' : 'Log In'}
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
