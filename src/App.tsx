/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ListingsView } from './components/ListingsView';
import { SeekersView } from './components/SeekersView';
import { PostGeneratorView } from './components/PostGeneratorView';
import { ScamDetectorView } from './components/ScamDetectorView';
import { ZoneGuideView } from './components/ZoneGuideView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { AddListingModal } from './components/AddListingModal';
import { AddSeekerModal } from './components/AddSeekerModal';
import { ImportModal } from './components/ImportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { INITIAL_LISTINGS, INITIAL_SEEKERS, FACEBOOK_GROUP_URL, FACEBOOK_GROUP_ID } from './data/milanData';
import { Listing, SeekerProfile, UserProfile } from './types';
import { 
  seedInitialDataIfEmpty, 
  subscribeToListings, 
  subscribeToSeekers, 
  saveListingToFirestore, 
  saveMultipleListingsToFirestore,
  saveSeekerToFirestore 
} from './services/dbService';
import { subscribeToAuth } from './services/authService';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Heart, 
  Users, 
  MessageSquare,
  Sparkles,
  MapPin,
  Database
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [activeTab, setActiveTab] = useState<'listings' | 'seekers' | 'generator' | 'scamDetector' | 'zones'>('listings');
  
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [seekers, setSeekers] = useState<SeekerProfile[]>(INITIAL_SEEKERS);
  const [dbConnected, setDbConnected] = useState(false);
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isAddSeekerOpen, setIsAddSeekerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Initialize Firestore and setup real-time subscriptions
  useEffect(() => {
    let unsubscribeListings: (() => void) | undefined;
    let unsubscribeSeekers: (() => void) | undefined;
    let unsubscribeAuth: (() => void) | undefined;

    // Listen to Firebase Auth state changes
    unsubscribeAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
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
    };
  }, []);

  // Context passed when clicking "Verifica con AI" from an ad
  const [scamCheckTarget, setScamCheckTarget] = useState<{
    text: string;
    price?: number;
    zone?: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleVerifyAI = (listing: Listing) => {
    setScamCheckTarget({
      text: `${listing.title}\n${listing.description}\nZona: ${listing.zone} - ${listing.address}\nCanone: €${listing.price}/mese + spese €${listing.billsEstimate}\nCaparra: ${listing.depositMonths} mensilità\nContratto: ${listing.contractType}`,
      price: listing.price,
      zone: listing.zone,
    });
    setActiveTab('scamDetector');
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
        onOpenImport={() => setIsImportModalOpen(true)}
        lang={lang}
        setLang={setLang}
        dbConnected={dbConnected}
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'listings' && (
          <ListingsView
            listings={listings}
            onSelectListing={(l) => setSelectedListing(l)}
            onVerifyWithAI={handleVerifyAI}
            onOpenAddListing={() => setIsAddListingOpen(true)}
            onOpenImport={() => setIsImportModalOpen(true)}
            lang={lang}
          />
        )}

        {activeTab === 'seekers' && (
          <SeekersView
            seekers={seekers}
            onOpenAddSeeker={() => setIsAddSeekerOpen(true)}
            lang={lang}
          />
        )}

        {activeTab === 'generator' && (
          <PostGeneratorView lang={lang} />
        )}

        {activeTab === 'scamDetector' && (
          <ScamDetectorView
            initialText={scamCheckTarget?.text}
            initialPrice={scamCheckTarget?.price}
            initialZone={scamCheckTarget?.zone}
            lang={lang}
          />
        )}

        {activeTab === 'zones' && (
          <ZoneGuideView lang={lang} />
        )}
      </main>

      {/* Detail & Action Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onVerifyAI={handleVerifyAI}
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
        />
      )}

      {/* Community Footer */}
      <footer id="app-footer" className="bg-white border-t border-stone-200 py-10 mt-12">
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
                <li className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AI Scam Detector</span>
                </li>
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
            <div className="flex items-center gap-1">
              <span>{isIt ? 'Realizzato per studenti e coinquilini a Milano' : 'Built for students and flatmates in Milan'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
