import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, Euro, Sparkles } from 'lucide-react';
import { Listing, RoomType, MetroLine, University, UserProfile } from '../types';

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
  if (!isOpen) return null;
  const isIt = lang === 'it';

  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('singola');
  const [price, setPrice] = useState('650');
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [billsEstimate, setBillsEstimate] = useState('70');
  const [depositMonths, setDepositMonths] = useState(2);
  const [zone, setZone] = useState('Città Studi / Piola');
  const [address, setAddress] = useState('Via Pacini, Milano');
  const [metroStation, setMetroStation] = useState('Piola');
  const [metroLine, setMetroLine] = useState<MetroLine>('M2');
  const [metroWalkingMinutes, setMetroWalkingMinutes] = useState(4);
  const [availableFrom, setAvailableFrom] = useState('2026-10-01');
  const [minStayMonths, setMinStayMonths] = useState(12);
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [landlordType, setLandlordType] = useState<'Privato' | 'Coinquilino'>('Privato');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const newListing: Listing = {
      id: `list-${Date.now()}`,
      title,
      roomType,
      price: Number(price),
      billsIncluded,
      billsEstimate: billsIncluded ? 0 : Number(billsEstimate),
      depositMonths,
      zone,
      address,
      metroStation,
      metroLine,
      metroWalkingMinutes,
      availableFrom,
      minStayMonths,
      photos: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      ],
      description: description || 'Alloggio accogliente e luminoso per studenti o giovani lavoratori a Milano con contratto registrato.',
      contractType: 'Transitorio Studenti',
      landlordType,
      authorName: authorName.trim() || user?.displayName || 'Utente Gruppo FB',
      authorAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: true,
      targetUniversities: ['PoliMi Leonardo', 'Statale (Festa del Perdono)'],
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
                {isIt ? 'Quartiere' : 'District'}
              </label>
              <select
                id="new-listing-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="Città Studi / Piola">Città Studi / Piola</option>
                <option value="Navigli / Porta Genova">Navigli / Porta Genova</option>
                <option value="Porta Romana / Crocetta">Porta Romana / Crocetta</option>
                <option value="Isola / Garibaldi">Isola / Garibaldi</option>
                <option value="Lambrate / NoLo">Lambrate / NoLo</option>
                <option value="Bovisa / Dergano">Bovisa / Dergano</option>
                <option value="Bicocca / Greco">Bicocca / Greco</option>
                <option value="Porta Venezia / Loreto">Porta Venezia / Loreto</option>
              </select>
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
                placeholder="Via Pacini, Milano"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Linea Metro' : 'Metro Line'}
              </label>
              <select
                id="new-listing-metro-line"
                value={metroLine}
                onChange={(e: any) => setMetroLine(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="M1">M1 Rossa</option>
                <option value="M2">M2 Verde</option>
                <option value="M3">M3 Gialla</option>
                <option value="M4">M4 Blu</option>
                <option value="M5">M5 Lilla</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                {isIt ? 'Fermata Metro' : 'Metro Station'}
              </label>
              <input
                id="new-listing-station"
                type="text"
                value={metroStation}
                onChange={(e) => setMetroStation(e.target.value)}
                placeholder="Piola"
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
