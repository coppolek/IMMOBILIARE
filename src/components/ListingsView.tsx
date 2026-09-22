import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Train, 
  Euro, 
  ShieldCheck, 
  Sparkles, 
  Filter, 
  ExternalLink,
  GraduationCap,
  Wifi,
  Wind,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Calendar,
  UploadCloud
} from 'lucide-react';
import { Listing, RoomType, MetroLine, University } from '../types';
import { FACEBOOK_GROUP_URL } from '../data/milanData';

interface ListingsViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onVerifyWithAI: (listing: Listing) => void;
  onOpenAddListing: () => void;
  onOpenImport?: () => void;
  lang: 'it' | 'en';
}

export const ListingsView: React.FC<ListingsViewProps> = ({
  listings,
  onSelectListing,
  onVerifyWithAI,
  onOpenAddListing,
  onOpenImport,
  lang,
}) => {
  const isIt = lang === 'it';

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1400);
  const [selectedMetro, setSelectedMetro] = useState<string>('all');
  const [selectedUni, setSelectedUni] = useState<string>('all');
  const [onlyBillsIncluded, setOnlyBillsIncluded] = useState(false);
  const [onlyImmobiliare, setOnlyImmobiliare] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'recent' | 'metro'>('recent');

  const availableZones = useMemo(() => {
    const set = new Set<string>();
    listings.forEach(l => {
      if (l.zone) set.add(l.zone);
    });
    return Array.from(set).sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchZone = item.zone.toLowerCase().includes(q);
          const matchAddress = item.address.toLowerCase().includes(q);
          const matchMetro = item.metroStation.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchZone && !matchAddress && !matchMetro) {
            return false;
          }
        }
        if (selectedZone !== 'all' && !item.zone.toLowerCase().includes(selectedZone.toLowerCase())) {
          return false;
        }
        if (selectedType !== 'all' && item.roomType !== selectedType) {
          return false;
        }
        if (item.price > maxPrice) {
          return false;
        }
        if (selectedMetro !== 'all' && item.metroLine !== selectedMetro) {
          return false;
        }
        if (selectedUni !== 'all' && !item.targetUniversities.some(u => u.toLowerCase().includes(selectedUni.toLowerCase()))) {
          return false;
        }
        if (onlyBillsIncluded && !item.billsIncluded) {
          return false;
        }
        if (onlyImmobiliare && !(item.externalListingUrl?.includes('immobiliare.it') || item.source === 'immobiliare')) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'metro') return a.metroWalkingMinutes - b.metroWalkingMinutes;
        return 0; // default order is recent
      });
  }, [listings, searchTerm, selectedZone, selectedType, maxPrice, selectedMetro, selectedUni, onlyBillsIncluded, onlyImmobiliare, sortBy]);

  const metroColors: Record<MetroLine, { bg: string; text: string; border: string }> = {
    M1: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
    M2: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' },
    M3: { bg: 'bg-amber-400', text: 'text-stone-900', border: 'border-amber-500' },
    M4: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
    M5: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
  };

  const roomTypeLabels: Record<RoomType, { it: string; en: string }> = {
    singola: { it: 'Stanza Singola', en: 'Single Room' },
    doppia: { it: 'Stanza Doppia', en: 'Double Room' },
    monolocale: { it: 'Monolocale', en: 'Studio Flat' },
    bilocale: { it: 'Bilocale', en: 'One-Bedroom Flat' },
    posto_letto: { it: 'Posto Letto', en: 'Bed in Shared Room' },
  };

  return (
    <div id="listings-view" className="space-y-6">
      {/* Community Hero & Quick Action */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden border border-stone-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none hidden lg:block" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isIt ? 'Annunci Moderati & Verificati' : 'Moderated & Verified Listings'}
            </span>
            <span className="text-xs text-stone-400">
              {isIt ? 'Gruppo FB: 477013955229676' : 'FB Group: 477013955229676'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif text-stone-50 mb-3">
            {isIt ? 'Stanze e appartamenti in affitto a Milano' : 'Rooms & flats for rent in Milan'}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6 max-w-2xl">
            {isIt 
              ? 'Tutti gli alloggi provengono da studenti, inquilini uscenti e proprietari verificati del gruppo Facebook "Affitti Milano". Con protezione AI contro annunci truffa o richieste di caparra sospette.'
              : 'Direct listings from students, outgoing tenants, and verified private landlords in the "Affitti Milano" Facebook group. Includes AI Shield against housing scams.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              id="hero-facebook-button"
              href={FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <span>{isIt ? 'Vedi Gruppo Facebook (85k+ iscritti)' : 'View Facebook Group (85k+ members)'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              id="hero-post-listing-button"
              onClick={onOpenAddListing}
              className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>{isIt ? '+ Pubblica un Alloggio' : '+ Post an Accommodation'}</span>
            </button>

            {onOpenImport && (
              <button
                id="hero-import-listings-button"
                onClick={onOpenImport}
                className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>{isIt ? 'Importa CSV / RSS' : 'Import CSV / RSS'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top search input & sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="search-listing-input"
              type="text"
              placeholder={isIt ? "Cerca per via, quartiere (es. Piola, Navigli, Bovisa) o fermata metro..." : "Search by street, zone, or metro station..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">{isIt ? 'Ordina:' : 'Sort:'}</span>
              <select
                id="select-sort-listings"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
              >
                <option value="recent">{isIt ? 'Più recenti' : 'Most Recent'}</option>
                <option value="price_asc">{isIt ? 'Prezzo crescente' : 'Price: Low to High'}</option>
                <option value="price_desc">{isIt ? 'Prezzo decrescente' : 'Price: High to Low'}</option>
                <option value="metro">{isIt ? 'Vicinanza Metro' : 'Closest to Metro'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-stone-100 text-xs">
          {/* Zone Selector */}
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              {isIt ? 'Quartiere / Zona' : 'Milan District'}
            </label>
            <select
              id="filter-zone-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">{isIt ? 'Tutte le zone' : 'All Districts'}</option>
              {availableZones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              {isIt ? 'Tipologia' : 'Room Type'}
            </label>
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">{isIt ? 'Tutte le tipologie' : 'All Types'}</option>
              <option value="singola">{isIt ? 'Stanza Singola' : 'Single Room'}</option>
              <option value="doppia">{isIt ? 'Stanza Doppia' : 'Double Room'}</option>
              <option value="monolocale">{isIt ? 'Monolocale' : 'Studio'}</option>
              <option value="bilocale">{isIt ? 'Bilocale' : '1-Bedroom Flat'}</option>
              <option value="posto_letto">{isIt ? 'Posto Letto' : 'Bed in Shared'}</option>
            </select>
          </div>

          {/* University proximity */}
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              {isIt ? 'Vicinanza Università' : 'Near University'}
            </label>
            <select
              id="filter-university-select"
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">{isIt ? 'Tutti gli atenei' : 'All Universities'}</option>
              <option value="PoliMi Leonardo">PoliMi Leonardo</option>
              <option value="PoliMi Bovisa">PoliMi Bovisa</option>
              <option value="Bocconi">Bocconi</option>
              <option value="Statale">UniMi Statale</option>
              <option value="Cattolica">Cattolica</option>
              <option value="Bicocca">Bicocca</option>
              <option value="NABA">NABA / Marangoni</option>
            </select>
          </div>

          {/* Metro Line */}
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              {isIt ? 'Linea Metropolitana' : 'Metro Line'}
            </label>
            <select
              id="filter-metro-select"
              value={selectedMetro}
              onChange={(e) => setSelectedMetro(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">{isIt ? 'Qualsiasi linea' : 'Any Line'}</option>
              <option value="M1">M1 Rossa (Duomo/Cadorna)</option>
              <option value="M2">M2 Verde (Centrale/Piola/Genova)</option>
              <option value="M3">M3 Gialla (Centrale/Duomo/Romana)</option>
              <option value="M4">M4 Blu (Linate/San Babila)</option>
              <option value="M5">M5 Lilla (Garibaldi/Bicocca/San Siro)</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-stone-600">
                {isIt ? 'Budget max' : 'Max Budget'}
              </label>
              <span className="font-bold text-amber-700">€{maxPrice}/mese</span>
            </div>
            <input
              id="filter-price-range"
              type="range"
              min="400"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                id="toggle-bills-included"
                type="checkbox"
                checked={onlyBillsIncluded}
                onChange={(e) => setOnlyBillsIncluded(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span>{isIt ? 'Solo con spese incluse (tutto compreso)' : 'Bills included only (all-in)'}</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                id="toggle-immobiliare-only"
                type="checkbox"
                checked={onlyImmobiliare}
                onChange={(e) => setOnlyImmobiliare(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                {isIt ? 'Solo annunci da Immobiliare.it' : 'Only Immobiliare.it listings'}
              </span>
            </label>
          </div>

          <div className="text-xs text-stone-500">
            {isIt ? 'Trovati ' : 'Found '}
            <strong className="text-stone-900">{filteredListings.length}</strong>
            {isIt ? ' alloggi disponibili' : ' available listings'}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 mb-1">
            {isIt ? 'Nessun alloggio trovato con questi filtri' : 'No listings found matching these filters'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            {isIt ? 'Prova ad alzare il budget massimo o a selezionare "Tutte le zone".' : 'Try increasing your budget or selecting "All Districts".'}
          </p>
          <button
            id="reset-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setSelectedZone('all');
              setSelectedType('all');
              setMaxPrice(1400);
              setSelectedMetro('all');
              setSelectedUni('all');
              setOnlyBillsIncluded(false);
              setOnlyImmobiliare(false);
            }}
            className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors"
          >
            {isIt ? 'Reimposta tutti i filtri' : 'Reset all filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const metroBadge = metroColors[listing.metroLine];
            const typeObj = roomTypeLabels[listing.roomType];

            return (
              <div
                key={listing.id}
                id={`listing-card-${listing.id}`}
                className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Photo & Top Badges */}
                <div 
                  className="relative aspect-16/10 overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => onSelectListing(listing)}
                >
                  <img
                    src={listing.photos[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Room Type & Source Tags */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 text-stone-900 text-[11px] font-bold shadow-xs backdrop-blur-xs">
                      {isIt ? typeObj.it : typeObj.en}
                    </span>
                    {(listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare') && (
                      <span className="px-2 py-0.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs tracking-tight">
                        Immobiliare.it
                      </span>
                    )}
                  </div>

                  {/* Metro Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                    <span className={`w-4 h-4 rounded text-[9px] font-extrabold flex items-center justify-center ${metroBadge.bg} ${metroBadge.text}`}>
                      {listing.metroLine}
                    </span>
                    <span>{listing.metroStation}</span>
                    <span className="text-stone-400 text-[10px]">• {listing.metroWalkingMinutes}m</span>
                  </div>

                  {/* Bottom Price in Photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <div className="text-2xl font-extrabold font-serif tracking-tight drop-shadow-sm">
                        €{listing.price}
                        <span className="text-xs font-normal text-stone-200">/mese</span>
                      </div>
                      <div className="text-[11px] font-medium text-stone-300">
                        {listing.billsIncluded 
                          ? (isIt ? '✓ Tutte le spese incluse' : '✓ All bills included')
                          : (isIt ? `+ ~€${listing.billsEstimate} spese stimate` : `+ ~€${listing.billsEstimate} est. bills`)}
                      </div>
                    </div>

                    {listing.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {isIt ? 'Verificato FB' : 'Verified'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold text-stone-700">{listing.zone}</span>
                      <span className="text-stone-300">•</span>
                      <span className="truncate">{listing.address}</span>
                    </div>

                    <h3 
                      className="text-sm sm:text-base font-bold text-stone-900 line-clamp-2 hover:text-amber-700 cursor-pointer transition-colors"
                      onClick={() => onSelectListing(listing)}
                    >
                      {listing.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>

                    {/* Universities tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {listing.targetUniversities.map((uni, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                        >
                          <GraduationCap className="w-3 h-3 text-amber-600" />
                          {uni}
                        </span>
                      ))}
                    </div>

                    {/* Amenities chips */}
                    <div className="flex items-center gap-3 pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                      {listing.amenities.wifi && (
                        <span className="flex items-center gap-1" title="Wi-Fi Fibra">
                          <Wifi className="w-3.5 h-3.5 text-stone-400" />
                          Wi-Fi
                        </span>
                      )}
                      {listing.amenities.airConditioning && (
                        <span className="flex items-center gap-1" title="Aria Condizionata">
                          <Wind className="w-3.5 h-3.5 text-stone-400" />
                          A/C
                        </span>
                      )}
                      {listing.amenities.desk && (
                        <span className="flex items-center gap-1" title="Scrivania Studio">
                          Scrivania
                        </span>
                      )}
                      <span className="text-stone-400 ml-auto">
                        {listing.depositMonths} {isIt ? 'mesi caparra' : 'months deposit'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Author Footer */}
                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={listing.authorAvatar}
                        alt={listing.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-stone-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-800 truncate">
                          {listing.authorName}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {listing.landlordType} • {listing.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare') && (
                        <a
                          id={`btn-immobiliare-${listing.id}`}
                          href={listing.externalListingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={isIt ? "Apri annuncio originale su Immobiliare.it" : "Open original listing on Immobiliare.it"}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline text-[11px]">Immobiliare</span>
                        </a>
                      )}

                      <button
                        id={`btn-verify-ai-${listing.id}`}
                        onClick={() => onVerifyWithAI(listing)}
                        title={isIt ? "Verifica sicurezza e prezzo con AI Anti-Truffa" : "Check safety with AI Scam Detector"}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs transition-colors flex items-center gap-1 font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden xl:inline text-[11px]">{isIt ? 'Verifica AI' : 'Check AI'}</span>
                      </button>

                      <button
                        id={`btn-open-details-${listing.id}`}
                        onClick={() => onSelectListing(listing)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                      >
                        {isIt ? 'Dettagli' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
