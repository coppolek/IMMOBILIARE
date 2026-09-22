import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Train, 
  Euro, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  GraduationCap, 
  Wifi, 
  Wind, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Listing } from '../types';
import { FACEBOOK_GROUP_URL } from '../data/milanData';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onVerifyAI: (listing: Listing) => void;
  lang: 'it' | 'en';
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onVerifyAI,
  lang,
}) => {
  if (!listing) return null;
  const isIt = lang === 'it';
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="listing-detail-modal"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              {listing.roomType.toUpperCase()}
            </span>
            <span className="text-xs text-stone-500">• {listing.zone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors text-xs flex items-center gap-1 font-medium"
              title="Copia link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              id="close-listing-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Photo Gallery */}
          <div className="space-y-2">
            <div className="aspect-16/9 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
              <img
                src={listing.photos[activePhotoIndex] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'}
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
            {listing.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activePhotoIndex === idx ? 'border-amber-600 scale-95 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={p} 
                      alt="" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mb-1">
                {listing.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-stone-700">{listing.address}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <Train className="w-3.5 h-3.5 text-stone-500" />
                  {listing.metroLine} {listing.metroStation} ({listing.metroWalkingMinutes} min a piedi)
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-3xl font-extrabold font-serif text-amber-900">
                €{listing.price}
                <span className="text-xs font-normal text-stone-500">/mese</span>
              </div>
              <div className="text-xs font-medium text-stone-500">
                {listing.billsIncluded ? '✓ Spese condominiali e utenze incluse' : `+ ~€${listing.billsEstimate} spese stimate`}
              </div>
            </div>
          </div>

          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 block mb-0.5">{isIt ? 'Tipologia Contratto' : 'Contract Type'}</span>
              <span className="font-bold text-stone-800">{listing.contractType}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 block mb-0.5">{isIt ? 'Deposito Cauzionale' : 'Deposit'}</span>
              <span className="font-bold text-stone-800">{listing.depositMonths} {isIt ? 'mensilità (a norma)' : 'months (legal)'}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 block mb-0.5">{isIt ? 'Disponibile da' : 'Available from'}</span>
              <span className="font-bold text-stone-800">{listing.availableFrom}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 block mb-0.5">{isIt ? 'Permanenza Minima' : 'Min Stay'}</span>
              <span className="font-bold text-stone-800">{listing.minStayMonths} {isIt ? 'mesi' : 'months'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              {isIt ? 'Descrizione Alloggio' : 'Description'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/60 p-4 rounded-xl border border-stone-100 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Target Universities */}
          <div>
            <h3 className="text-xs font-bold text-stone-800 mb-2">
              {isIt ? 'Comodo per gli atenei:' : 'Ideal for universities:'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {listing.targetUniversities.map((uni, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                  {uni}
                </span>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xs font-bold text-stone-800 mb-2">
              {isIt ? 'Servizi e dotazioni:' : 'Amenities:'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {listing.amenities.wifi && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <Wifi className="w-4 h-4 text-stone-500" /> Wi-Fi Fibra Ultraveloce
                </div>
              )}
              {listing.amenities.airConditioning && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <Wind className="w-4 h-4 text-stone-500" /> Aria Condizionata
                </div>
              )}
              {listing.amenities.desk && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-stone-500" /> Scrivania e sedia studio
                </div>
              )}
              {listing.amenities.washingMachine && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-stone-500" /> Lavatrice in casa
                </div>
              )}
              {listing.amenities.balcony && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-stone-500" /> Balcone privato
                </div>
              )}
              {listing.amenities.elevator && (
                <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-stone-500" /> Ascensore nel palazzo
                </div>
              )}
            </div>
          </div>

          {/* Author Card & Source */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={listing.authorAvatar}
                alt={listing.authorName}
                className="w-12 h-12 rounded-full object-cover border border-stone-200"
              />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">
                  {listing.authorName}
                </h4>
                <div className="text-xs text-stone-500">
                  {listing.landlordType} {listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare' ? '• Annuncio Immobiliare.it' : '• Membro verificato'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare') && (
                <a
                  id="modal-author-immobiliare-link"
                  href={listing.externalListingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                  <span>Immobiliare.it</span>
                </a>
              )}

              <button
                id="modal-verify-ai-btn"
                onClick={() => {
                  onClose();
                  onVerifyAI(listing);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isIt ? 'Verifica con AI' : 'Check with AI'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-stone-100 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-stone-400">
            {listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare'
              ? 'Provenienza: Portale Immobiliare.it'
              : `Pubblicato ${listing.createdAt} nel Gruppo 477013955229676`}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If from Immobiliare.it, provide direct link to the listing */}
            {(listing.externalListingUrl?.includes('immobiliare.it') || listing.source === 'immobiliare') && (
              <a
                id="modal-open-immobiliare-btn"
                href={listing.externalListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>{isIt ? 'Vedi su Immobiliare.it' : 'View on Immobiliare.it'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <a
              id="modal-open-fb-btn"
              href={listing.authorFbProfileUrl || FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isIt ? 'Contatta nel Gruppo Facebook' : 'Contact on Facebook Group'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
