import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Mail, 
  Smartphone,
  MapPin,
  Sparkles,
  Link2
} from 'lucide-react';
import { Listing } from '../types';

interface ShareListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'it' | 'en';
}

export const ShareListingModal: React.FC<ShareListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen || !listing) return null;
  const isIt = lang === 'it';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Generate clean direct deep-link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?listing=${encodeURIComponent(listing.id)}`;

  const billsText = listing.billsIncluded 
    ? (isIt ? 'Spese incluse' : 'Bills included')
    : (isIt ? `+ ~€${listing.billsEstimate} spese` : `+ ~€${listing.billsEstimate} bills`);

  const shareTitle = `${listing.title} • €${listing.price}/m • Milano ${listing.zone}`;
  
  const shareMessage = isIt
    ? `🏠 Affitti Milano • ${listing.title}\n💶 Canone: €${listing.price}/mese (${billsText})\n📍 Zona: ${listing.zone} • Metro ${listing.metroLine} ${listing.metroStation}\n\n👉 Guarda tutti i dettagli e foto: ${shareUrl}`
    : `🏠 Affitti Milano • ${listing.title}\n💶 Rent: €${listing.price}/month (${billsText})\n📍 Zone: ${listing.zone} • Metro ${listing.metroLine} ${listing.metroStation}\n\n👉 View details & photos: ${shareUrl}`;

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareMessage,
        url: shareUrl,
      });
    } catch (err: any) {
      // User cancelled share or not supported
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Social share URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="share-listing-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden my-0 sm:my-8 max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile pull drag indicator */}
        <div className="pt-2 sm:hidden bg-stone-50 flex justify-center">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-stone-100 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
                {isIt ? 'Condividi questo Alloggio' : 'Share this Listing'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isIt ? 'Invia l\'annuncio ad amici o sui social' : 'Send this listing to friends or on social media'}
              </p>
            </div>
          </div>
          <button 
            id="btn-close-share-modal"
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Listing Preview Snippet */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center gap-3">
            <img
              src={listing.photos[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80'}
              alt={listing.title}
              className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  {listing.roomType}
                </span>
                <span className="text-xs font-extrabold text-stone-900">
                  €{listing.price}<span className="text-[10px] font-normal text-stone-500">/m</span>
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 truncate">
                {listing.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{listing.zone}</span>
                <span>• Metro {listing.metroLine} {listing.metroStation}</span>
              </div>
            </div>
          </div>

          {/* Native Mobile Share Button (if supported) */}
          {canNativeShare && (
            <button
              id="btn-native-share"
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{isIt ? 'Condividi tramite App del Telefono' : 'Share with Mobile Share Sheet'}</span>
            </button>
          )}

          {/* Social Platform Direct Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
              {isIt ? 'Condividi direttamente su:' : 'Share directly to:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <a
                id="share-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.126-.522-1.831-.76-3.003-2.614-3.094-2.736-.092-.123-.746-.992-.746-1.893 0-.9.472-1.343.64-1.527.168-.184.368-.231.492-.231.124 0 .248.002.355.008.113.006.264-.043.413.314.152.366.52 1.266.565 1.358.046.092.077.2.016.323-.062.123-.092.2-.184.307-.092.107-.193.24-.276.323-.092.092-.188.193-.081.378.107.184.475.786 1.021 1.272.704.628 1.297.822 1.482.914.184.092.292.077.4-.046.108-.123.461-.538.584-.723.123-.184.246-.153.415-.092.169.061 1.077.507 1.261.6.184.092.308.138.354.215.046.077.046.446-.098.851zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.174L2 22l4.981-1.306C8.423 21.547 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">WhatsApp</div>
                  <div className="text-[10px] text-emerald-600 truncate">Chat & Gruppi</div>
                </div>
              </a>

              {/* Telegram */}
              <a
                id="share-telegram-btn"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100/80 text-sky-800 border border-sky-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">Telegram</div>
                  <div className="text-[10px] text-sky-600 truncate">Canali & Chat</div>
                </div>
              </a>

              {/* Facebook */}
              <a
                id="share-facebook-btn"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">Facebook</div>
                  <div className="text-[10px] text-blue-600 truncate">Post & Gruppi</div>
                </div>
              </a>

              {/* X / Twitter */}
              <a
                id="share-twitter-btn"
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">X / Twitter</div>
                  <div className="text-[10px] text-stone-500 truncate">Post / Tweet</div>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                id="share-linkedin-btn"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">LinkedIn</div>
                  <div className="text-[10px] text-indigo-600 truncate">Condividi feed</div>
                </div>
              </a>

              {/* Email */}
              <a
                id="share-email-btn"
                href={emailUrl}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">Email</div>
                  <div className="text-[10px] text-amber-700 truncate">Invia messaggio</div>
                </div>
              </a>
            </div>
          </div>

          {/* Copy Direct Link Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">
              {isIt ? 'Link Diretto all\'Annuncio' : 'Direct Listing Link'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="share-link-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-700 select-all focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <button
                id="btn-copy-share-link"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isIt ? 'Copiato!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isIt ? 'Copia Link' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Full Formatted Post/Message */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500">
              {isIt ? 'Vuoi incollare l\'annuncio completo con testo e dettagli?' : 'Want to paste the full listing details with formatted text?'}
            </div>
            <button
              id="btn-copy-formatted-text"
              onClick={handleCopyFormattedText}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                copiedText
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isIt ? 'Testo Copiato!' : 'Text Copied!'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isIt ? 'Copia Testo Post' : 'Copy Post Text'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between text-xs text-stone-400">
          <span>{isIt ? 'ID Annuncio:' : 'Listing ID:'} <span className="font-mono">{listing.id}</span></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-stone-600 hover:bg-stone-200 font-semibold"
          >
            {isIt ? 'Chiudi' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
