import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, Euro, Sparkles, Navigation } from 'lucide-react';
import { Listing, RoomType, MetroLine, University, UserProfile } from '../types';
import { ALL_CAPOLUOGHI, CITIES_BY_REGION, getCityDetails } from '../data/italianCities';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: Listing) => void;
  lang: 'it' | 'en';
  user?: UserProfile | null;
}

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  lang,
  user
}) => {
  const isIt = lang === 'it';

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Milano');
  const [roomType, setRoomType] = useState<RoomType>('singola');
  const [price, setPrice] = useState('650');
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [billsEstimate, setBillsEstimate] = useState('70');
  const [depositMonths, setDepositMonths] = useState(2);
  const [zone, setZone] = useState('Città Studi / Piola');
  const [address, setAddress] = useState('Via Pacini, Milano');
  const [metroStation, setMetroStation] = useState('Piola / Stazione');
  const [metroLine, setMetroLine] = useState<MetroLine>('M2');
  const [metroWalkingMinutes, setMetroWalkingMinutes] = useState(4);
  const [availableFrom, setAvailableFrom] = useState('2026-10-01');
  const [minStayMonths, setMinStayMonths] = useState(12);
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [landlordType, setLandlordType] = useState<'Privato' | 'Coinquilino'>('Privato');

  if (!isOpen) return null;

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const details = getCityDetails(newCity);
    if (newCity !== 'Milano') {
      if (zone === 'Città Studi / Piola') {
        setZone('Centro / Stazione');
      }
      if (address === 'Via Pacini, Milano') {
        setAddress(`Via Roma, ${newCity}`);
      }
      setMetroStation(`Stazione / Mezzi ${newCity}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const cityDetails = getCityDetails(city);

    const newListing: Listing = {
      id: `list-${Date.now()}`,
      title,
      roomType,
      price: Number(price),
      city,
      region: cityDetails?.region || 'Lombardia',
      billsIncluded,
      billsEstimate: billsIncluded ? 0 : Number(billsEstimate),
      depositMonths,
      zone,
      address,
      metroStation: metroStation || `Centro ${city}`,
      metroLine,
      metroWalkingMinutes,
      availableFrom,
      minStayMonths,
      photos: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      ],
      description: description || `Alloggio accogliente e luminoso per studenti o lavoratori a ${city} con contratto registrato regolarmente.`,
      contractType: 'Transitorio Studenti',
      landlordType,
      authorName: authorName.trim() || user?.displayName || 'Utente puulp.it',
      authorAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: true,
      targetUniversities: city === 'Milano' ? ['PoliMi Leonardo', 'Statale (Festa del Perdono)'] : [],
      amenities: {
        wifi: true,
        desk: true,
        washingMachine: true,
        balcony: false,
        airConditioning: true,
        elevator: true,
        privateBathroom: false,
        dishwasher: false,
      },
      genderPreference: 'tutti',
      createdAt: isIt ? 'Appena pubblicato' : 'Just now',
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="add-listing-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden my-0 sm:my-8 max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden bg-stone-50 flex justify-center">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
              {isIt ? 'Pubblica un Alloggio (Offro Casa)' : 'Post an Accommodation (Offering)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs flex-1">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {isIt ? 'Titolo annuncio' : 'Listing Title'} *
            </label>
            <input
              id="new-listing-title"
              type="text"
              required
              placeholder={isIt ? "Es. Stanza singola con balcone a Piola M2" : "E.g. Single room with balcony at Piola M2"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* City Selection */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                {isIt ? 'Città Capoluogo' : 'Provincial Capital City'} *
              </label>
              <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                107 Capoluoghi puulp.it
              </span>
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Milano', 'Roma', 'Bologna', 'Torino', 'Firenze', 'Napoli', 'Padova', 'Pisa'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCityChange(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    city === c
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-amber-100/70 border border-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Dropdown with all 107 cities grouped by Region */}
            <select
              id="new-listing-city-select"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 text-xs"
            >
              {Object.entries(CITIES_BY_REGION).map(([regionName, cityList]) => (
                <optgroup key={regionName} label={`── ${regionName} ──`}>
                  {cityList.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.provinceCode}) - {c.region}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Tipologia' : 'Typology'}
              </label>
              <select
                id="new-listing-type"
                value={roomType}
                onChange={(e: any) => setRoomType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="singola">{isIt ? 'Stanza Singola' : 'Single Room'}</option>
                <option value="doppia">{isIt ? 'Stanza Doppia' : 'Double Room'}</option>
                <option value="monolocale">{isIt ? 'Monolocale' : 'Studio'}</option>
                <option value="bilocale">{isIt ? 'Bilocale' : '1-Bedroom Flat'}</option>
                <option value="posto_letto">{isIt ? 'Posto Letto' : 'Bed in Shared'}</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Canone (€/mese)' : 'Rent (€/mo)'} *
              </label>
              <input
                id="new-listing-price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
            <input
              id="new-listing-bills"
              type="checkbox"
              checked={billsIncluded}
              onChange={(e) => setBillsIncluded(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <label htmlFor="new-listing-bills" className="font-semibold text-stone-800 cursor-pointer">
              {isIt ? 'Tutte le spese e utenze sono incluse nel prezzo' : 'All bills and utilities are included in the price'}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Quartiere / Zona' : 'District / Zone'} *
              </label>
              <input
                id="new-listing-zone"
                type="text"
                required
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder={isIt ? `Es. Centro, Stazione, San Lorenzo (${city})` : `E.g. Center, Station (${city})`}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Indirizzo o via' : 'Address or street'}
              </label>
              <input
                id="new-listing-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Via Roma, ${city}`}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {city === 'Milano' ? (isIt ? 'Linea Metro' : 'Metro Line') : (isIt ? 'Mezzo / Linea' : 'Transport Line')}
              </label>
              <select
                id="new-listing-metro-line"
                value={metroLine}
                onChange={(e: any) => setMetroLine(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs"
              >
                {city === 'Milano' ? (
                  <>
                    <option value="M1">M1 Rossa</option>
                    <option value="M2">M2 Verde</option>
                    <option value="M3">M3 Gialla</option>
                    <option value="M4">M4 Blu</option>
                    <option value="M5">M5 Lilla</option>
                  </>
                ) : (
                  <>
                    <option value="M1">Metro / Tram Principale</option>
                    <option value="M2">Linea 2 / Bus Rapido</option>
                    <option value="M3">Stazione FS / Regionale</option>
                    <option value="M4">Linea Università / Campus</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Fermata o Stazione' : 'Station or Stop'}
              </label>
              <input
                id="new-listing-station"
                type="text"
                value={metroStation}
                onChange={(e) => setMetroStation(e.target.value)}
                placeholder={isIt ? `Es. Stazione FS o fermata vicina` : `E.g. Main station or stop`}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Minuti a piedi' : 'Walk min'}
              </label>
              <input
                id="new-listing-walk"
                type="number"
                value={metroWalkingMinutes}
                onChange={(e) => setMetroWalkingMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {isIt ? 'Descrizione dettagliata' : 'Detailed Description'}
            </label>
            <textarea
              id="new-listing-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIt ? "Composizione appartamento, coinquilini presenti, riscaldamento, cauzione..." : "Apartment details, flatmates, heating, deposit..."}
              className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Il tuo nome' : 'Your Name'}
              </label>
              <input
                id="new-listing-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Marco"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Sei un:' : 'You are:'}
              </label>
              <select
                id="new-listing-landlord-type"
                value={landlordType}
                onChange={(e: any) => setLandlordType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="Privato">{isIt ? 'Proprietario privato' : 'Private landlord'}</option>
                <option value="Coinquilino">{isIt ? 'Coinquilino che cerca subentrante' : 'Flatmate seeking replacement'}</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 bg-white sticky bottom-0 z-10 p-3 sm:p-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 flex items-center justify-end gap-2 pb-[max(env(safe-area-inset-bottom,0px),14px)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl text-xs sm:text-sm"
            >
              {isIt ? 'Annulla' : 'Cancel'}
            </button>
            <button
              id="btn-submit-new-listing"
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs text-xs sm:text-sm"
            >
              {isIt ? 'Pubblica Annuncio' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
