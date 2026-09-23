/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ListingsView } from './components/ListingsView';
import { SeekersView } from './components/SeekersView';
import { PostGeneratorView } from './components/PostGeneratorView';
import { ZoneGuideView } from './components/ZoneGuideView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { AddListingModal } from './components/AddListingModal';
import { AddSeekerModal } from './components/AddSeekerModal';
import { ImportModal } from './components/ImportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdBanner } from './components/AdBanner';
import { AdminAdSenseModal } from './components/AdminAdSenseModal';
import { AdminImportPanel } from './components/AdminImportPanel';
import { ShareListingModal } from './components/ShareListingModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NewsletterSubscribeModal } from './components/NewsletterSubscribeModal';
import { NewsletterWidget } from './components/NewsletterWidget';
import { INITIAL_LISTINGS, INITIAL_SEEKERS, FACEBOOK_GROUP_URL, FACEBOOK_GROUP_ID } from './data/milanData';
import { Listing, SeekerProfile, UserProfile, AdSenseConfig, AppNotification } from './types';
import { 
  seedInitialDataIfEmpty, 
  subscribeToListings, 
  subscribeToSeekers, 
  saveListingToFirestore, 
  saveMultipleListingsToFirestore,
  saveSeekerToFirestore,
  subscribeToAdSenseConfig,
  saveAdSenseConfig,
  getDefaultAdSenseConfig
} from './services/dbService';
import { subscribeToAuth, isUserAdmin } from './services/authService';
import { subscribeToNotifications, seedNotificationDataIfEmpty } from './services/subscriberService';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Heart, 
  Users, 
  MessageSquare,
  Sparkles,
  MapPin,
  Database,
  Settings
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [activeTab, setActiveTab] = useState<'listings' | 'seekers' | 'zones'>('listings');
  
  // Admin Panel Full View State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelInitialTab, setAdminPanelInitialTab] = useState<'importer' | 'generator' | 'adsense' | 'catalog' | 'maintenance' | 'logs' | 'subscribers'>('importer');
  
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [seekers, setSeekers] = useState<SeekerProfile[]>(INITIAL_SEEKERS);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Google AdSense state
  const [adConfig, setAdConfig] = useState<AdSenseConfig>(getDefaultAdSenseConfig());
  const [isAdminAdSenseOpen, setIsAdminAdSenseOpen] = useState(false);

  // In-App Notifications & Newsletter state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sharingListing, setSharingListing] = useState<Listing | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isAddSeekerOpen, setIsAddSeekerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenAdminPanel = (tab: 'importer' | 'generator' | 'adsense' | 'catalog' | 'maintenance' | 'logs' | 'subscribers' = 'importer') => {
    setAdminPanelInitialTab(tab);
    setIsAdminPanelOpen(true);
  };

  // Helper to determine unread notifications
  const getIsNotificationRead = (notif: AppNotification): boolean => {
    if (user && notif.readBy && notif.readBy.includes(user.uid)) return true;
    try {
      const readSet: string[] = JSON.parse(localStorage.getItem('milan_read_notifications') || '[]');
      return readSet.includes(notif.id);
    } catch {
      return false;
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !getIsNotificationRead(n)).length;

  // Deep-linking: auto-open listing if ?listing= or ?id= is in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('listing') || params.get('id');
    if (listingId && listings.length > 0) {
      const found = listings.find((l) => l.id === listingId);
      if (found) {
        setSelectedListing(found);
      }
    }
  }, [listings]);

  // Sync browser URL and document title when selectedListing changes
  const handleSelectListing = (listing: Listing | null) => {
    setSelectedListing(listing);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (listing) {
        url.searchParams.set('listing', listing.id);
        window.history.replaceState({}, '', url.toString());
        document.title = `${listing.title} • €${listing.price}/m • Affitti Milano`;
      } else {
        url.searchParams.delete('listing');
        url.searchParams.delete('id');
        const cleanPath = url.pathname + (url.search ? url.search : '');
        window.history.replaceState({}, '', cleanPath);
        document.title = 'Affitti Milano • Stanze e Alloggi Universitari';
      }
    }
  };

  // Initialize Firestore and setup real-time subscriptions
  useEffect(() => {
    let unsubscribeListings: (() => void) | undefined;
    let unsubscribeSeekers: (() => void) | undefined;
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeAdSense: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;

    // Listen to Firebase Auth state changes
    unsubscribeAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });

    // Listen to Google AdSense configuration in real time
    unsubscribeAdSense = subscribeToAdSenseConfig((cfg) => {
      if (cfg) {
        setAdConfig(cfg);
      }
    });

    // Listen to in-app notifications in real time
    unsubscribeNotifications = subscribeToNotifications((notifs) => {
      if (notifs) {
        setNotifications(notifs);
      }
    });

    // Start subscriptions immediately
    unsubscribeListings = subscribeToListings((dbListings) => {
      if (dbListings && dbListings.length > 0) {
        setListings(dbListings);
      } else {
        // Fallback to imported file listings if collection is momentarily empty during seeding
        setListings(INITIAL_LISTINGS);
      }
      setDbConnected(true);
    });

    unsubscribeSeekers = subscribeToSeekers((dbSeekers) => {
      if (dbSeekers && dbSeekers.length > 0) {
        setSeekers(dbSeekers);
      }
      setDbConnected(true);
    });

    const initDb = async () => {
      try {
        await seedInitialDataIfEmpty();
        await seedNotificationDataIfEmpty();
        setDbConnected(true);
      } catch (err) {
        console.warn('Database initialization warning:', err);
      }
    };

    initDb();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeListings) unsubscribeListings();
      if (unsubscribeSeekers) unsubscribeSeekers();
      if (unsubscribeAdSense) unsubscribeAdSense();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  const handleSaveAdSenseConfig = async (newConfig: AdSenseConfig) => {
    setAdConfig(newConfig);
    try {
      await saveAdSenseConfig(newConfig, user?.email);
      showNotification(
        lang === 'it' 
          ? 'Configurazione Google AdSense salvata nel Cloud!' 
          : 'Google AdSense settings saved to Cloud DB!'
      );
    } catch (err) {
      console.error('Error persisting AdSense config:', err);
    }
  };

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddListing = async (newListing: Listing) => {
    // Optimistic UI update
    setListings((prev) => [newListing, ...prev]);
    showNotification(lang === 'it' ? 'Annuncio salvato sul Database Cloud con successo!' : 'Listing saved to Cloud Database!');
    
    // Persist to Cloud Firestore
    try {
      await saveListingToFirestore(newListing);
    } catch (error) {
      console.error('Error saving listing to DB:', error);
    }
  };

  const handleAddSeeker = async (newSeeker: SeekerProfile) => {
    // Optimistic UI update
    setSeekers((prev) => [newSeeker, ...prev]);
    showNotification(lang === 'it' ? 'Profilo di ricerca registrato nel Database Cloud!' : 'Seeker profile saved to Cloud Database!');
    
    // Persist to Cloud Firestore
    try {
      await saveSeekerToFirestore(newSeeker);
    } catch (error) {
      console.error('Error saving seeker to DB:', error);
    }
  };

  const handleImportListings = async (importedListings: Listing[]) => {
    if (importedListings.length === 0) return;

    if (!isUserAdmin(user)) {
      showNotification(
        lang === 'it' 
          ? 'Operazione negata: solo l\'amministratore (coppolek@gmail.com) può importare alloggi.' 
          : 'Access denied: only the administrator (coppolek@gmail.com) can import listings.'
      );
      return;
    }

    // Optimistic UI update
    setListings((prev) => [...importedListings, ...prev]);
    showNotification(
      lang === 'it' 
        ? `${importedListings.length} alloggi importati e sincronizzati sul Database Cloud!` 
        : `${importedListings.length} listings imported and synced with Cloud Database!`
    );

    // Batch persist to Cloud Firestore
    try {
      await saveMultipleListingsToFirestore(importedListings);
    } catch (error) {
      console.error('Error saving batch listings to DB:', error);
    }
  };

  const isIt = lang === 'it';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/70 text-stone-900 selection:bg-amber-200">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddListing={() => setIsAddListingOpen(true)}
        onOpenAddSeeker={() => setIsAddSeekerOpen(true)}
        lang={lang}
        setLang={setLang}
        dbConnected={dbConnected}
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdminPanel={() => handleOpenAdminPanel('importer')}
        adConfig={adConfig}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenNewsletter={() => setIsNewsletterModalOpen(true)}
      />

      {/* Top Header Leaderboard AdSense Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdBanner 
          position="header" 
          config={adConfig} 
          onOpenAdmin={() => handleOpenAdminPanel('adsense')} 
          isAdmin={isUserAdmin(user)} 
        />
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area or Admin Control Panel */}
      {isAdminPanelOpen && isUserAdmin(user) ? (
        <div className="flex-1 w-full pb-12">
          <AdminImportPanel
            listings={listings}
            user={user}
            lang={lang}
            initialTab={adminPanelInitialTab}
            adConfig={adConfig}
            onSaveAdSenseConfig={saveAdSenseConfig}
            onOpenAdSenseModal={() => setIsAdminAdSenseOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onNotification={(msg) => showNotification(msg)}
            onBackToApp={() => setIsAdminPanelOpen(false)}
            onSelectListing={(id) => {
              const found = listings.find(l => l.id === id);
              if (found) {
                setIsAdminPanelOpen(false);
                setSelectedListing(found);
              }
            }}
          />
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'listings' && (
            <ListingsView
              listings={listings}
              onSelectListing={handleSelectListing}
              onShareListing={(l) => setSharingListing(l)}
              onOpenAddListing={() => setIsAddListingOpen(true)}
              lang={lang}
              adConfig={adConfig}
              onOpenAdSenseAdmin={() => handleOpenAdminPanel('adsense')}
              isAdmin={isUserAdmin(user)}
            />
          )}

          {activeTab === 'seekers' && (
            <SeekersView
              seekers={seekers}
              onOpenAddSeeker={() => setIsAddSeekerOpen(true)}
              lang={lang}
            />
          )}

          {activeTab === 'zones' && (
            <ZoneGuideView lang={lang} />
          )}

          {/* Newsletter Opt-in Banner Widget */}
          <NewsletterWidget isIt={isIt} onNotification={showNotification} />
        </main>
      )}

      {/* Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-4">
        <AdBanner 
          position="footer" 
          config={adConfig} 
          onOpenAdmin={() => setIsAdminAdSenseOpen(true)} 
          isAdmin={isUserAdmin(user)} 
        />
      </div>

      {/* Detail & Action Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => handleSelectListing(null)}
        lang={lang}
        adConfig={adConfig}
        onOpenAdSenseAdmin={() => setIsAdminAdSenseOpen(true)}
        isAdmin={isUserAdmin(user)}
        onShare={(l) => setSharingListing(l)}
      />

      {/* Dedicated Social Share Modal */}
      <ShareListingModal
        listing={sharingListing}
        isOpen={!!sharingListing}
        onClose={() => setSharingListing(null)}
        lang={lang}
      />

      <AddListingModal
        isOpen={isAddListingOpen}
        onClose={() => setIsAddListingOpen(false)}
        onAddListing={handleAddListing}
        lang={lang}
        user={user}
      />

      <AddSeekerModal
        isOpen={isAddSeekerOpen}
        onClose={() => setIsAddSeekerOpen(false)}
        onAddSeeker={handleAddSeeker}
        lang={lang}
        user={user}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportListings={handleImportListings}
        lang={lang}
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        initialMode={authModalMode}
        onSuccess={() => showNotification(isIt ? 'Accesso effettuato con successo!' : 'Logged in successfully!')}
      />

      {user && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          lang={lang}
          onProfileUpdated={(updated) => {
            setUser(updated);
            showNotification(isIt ? 'Profilo salvato!' : 'Profile saved!');
          }}
          onOpenAdminPanel={() => handleOpenAdminPanel('importer')}
          onOpenGenerator={() => handleOpenAdminPanel('generator')}
          onOpenImport={() => handleOpenAdminPanel('importer')}
          onOpenAdSenseAdmin={() => handleOpenAdminPanel('adsense')}
          onOpenSubscribers={() => handleOpenAdminPanel('subscribers')}
        />
      )}

      {/* Admin AdSense Modal */}
      <AdminAdSenseModal
        isOpen={isAdminAdSenseOpen}
        onClose={() => setIsAdminAdSenseOpen(false)}
        config={adConfig}
        onSaveConfig={handleSaveAdSenseConfig}
        lang={lang}
        userEmail={user?.email}
      />

      {/* Real-time In-App Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        user={user}
        onSelectListing={(id) => {
          const found = listings.find(l => l.id === id);
          if (found) {
            handleSelectListing(found);
          }
        }}
        isIt={isIt}
      />

      {/* Newsletter Subscription Modal */}
      <NewsletterSubscribeModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
        user={user}
        isIt={isIt}
        onNotification={(msg) => showNotification(msg)}
      />

      {/* Community Footer */}
      <footer id="app-footer" className="bg-white border-t border-stone-200 pt-10 pb-28 md:py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base font-serif text-stone-900">
                  Affitti Milano • Community FB
                </span>
              </div>
              <p className="text-stone-500 leading-relaxed max-w-sm">
                {isIt 
                  ? 'Piattaforma e bacheca digitale collegata al gruppo Facebook "Affitti Milano" (ID: 477013955229676). Creata per connettere studenti universitari, giovani lavoratori e proprietari verificati in modo trasparente e sicuro.'
                  : 'Digital platform connected to the Facebook group "Affitti Milano" (ID: 477013955229676). Created to connect university students, young workers, and verified landlords securely.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={FACEBOOK_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isIt ? 'Gruppo Facebook Ufficiale' : 'Official Facebook Group'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-3">
                {isIt ? 'Atenei & Campus' : 'Universities'}
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li>• Politecnico di Milano (Leonardo & Bovisa)</li>
                <li>• Università Commerciale Luigi Bocconi</li>
                <li>• Università Cattolica del Sacro Cuore</li>
                <li>• Università degli Studi di Milano (Statale)</li>
                <li>• Università di Milano-Bicocca</li>
                <li>• NABA, IULM & Marangoni</li>
              </ul>
            </div>

            {/* Safety & Legal */}
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-3">
                {isIt ? 'Sicurezza & Diritti' : 'Safety & Rights'}
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li>• {isIt ? 'Annunci Verificati Community' : 'Verified Community Listings'}</li>
                <li>• Max 3 mensilità di caparra (L. 392/78)</li>
                <li>• Registrazione Agenzia delle Entrate RLI</li>
                <li>• Contratti Transitori Studenti</li>
                <li>• Cedolare Secca agevolata</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <div>
              © 2026 Affitti Milano Community • Gruppo Facebook ID 477013955229676
            </div>
            <div className="flex items-center gap-3">
              {isUserAdmin(user) && (
                <>
                  <button
                    id="footer-admin-panel-btn"
                    onClick={() => handleOpenAdminPanel('importer')}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 transition-colors font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isIt ? 'Pannello Admin' : 'Admin Panel'}</span>
                  </button>
                  <span className="hidden sm:inline">•</span>
                </>
              )}
              <span>{isIt ? 'Realizzato per studenti e coinquilini a Milano' : 'Built for students and flatmates in Milan'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
