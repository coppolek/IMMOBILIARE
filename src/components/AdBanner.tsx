import React, { useEffect, useRef } from 'react';
import { AdSenseConfig, AdBannerPosition, AdSenseBanner } from '../types';
import { Settings, ExternalLink, Sparkles, Image as ImageIcon, FileText, Code2 } from 'lucide-react';

interface AdBannerProps {
  position: AdBannerPosition;
  config: AdSenseConfig | null;
  className?: string;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  position,
  config,
  className = '',
  onOpenAdmin,
  isAdmin = false,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);
  const isPushed = useRef(false);

  // If AdSense/Ads are disabled globally, do not render
  if (!config || !config.enabled) {
    return null;
  }

  // Find active banner configured for this position
  const banner: AdSenseBanner | undefined = config.banners?.find(
    (b) => b.position === position && b.active
  );

  if (!banner) {
    return null;
  }

  const bannerType = banner.type || (banner.customSnippet ? 'code' : 'adsense');

  // Effect to load AdSense script and push ad request in production mode (for AdSense type)
  useEffect(() => {
    if (bannerType !== 'adsense' || config.testMode || !config.publisherId) {
      return;
    }

    // Check if Google AdSense script is already present
    const scriptId = 'google-adsense-script';
    let scriptTag = (document.getElementById(scriptId) ||
      document.querySelector('script[src*="adsbygoogle.js"]')) as HTMLScriptElement | null;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId}`;
      scriptTag.async = true;
      scriptTag.crossOrigin = 'anonymous';
      document.head.appendChild(scriptTag);
    }

    // Push ad slot safely with small delay to allow DOM attachment
    const timer = setTimeout(() => {
      try {
        const el = adRef.current;
        if (!el || !document.body.contains(el)) {
          return;
        }

        // Check if element has already been processed by Google AdSense
        if (
          el.getAttribute('data-adsbygoogle-status') ||
          el.getAttribute('data-ad-pushed') === 'true' ||
          el.children.length > 0 ||
          isPushed.current
        ) {
          return;
        }

        // Mark as pushed BEFORE calling push to prevent duplicate triggers
        el.setAttribute('data-ad-pushed', 'true');
        isPushed.current = true;

        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err: any) {
        // TagError or duplicate push swallowed gracefully
        console.debug('AdSense push handled:', err?.message || err);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [bannerType, config.testMode, config.publisherId, banner.slotId]);

  // Effect to execute scripts inside custom HTML snippet if present
  useEffect(() => {
    if (bannerType === 'code' && banner.customSnippet && codeContainerRef.current) {
      const container = codeContainerRef.current;
      container.innerHTML = banner.customSnippet;
      const scripts = container.getElementsByTagName('script');
      Array.from(scripts).forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [bannerType, banner.customSnippet]);

  // Dimension helpers for styling placeholder and container
  const getFormatClasses = () => {
    switch (banner.format) {
      case 'horizontal':
        return 'min-h-[90px] w-full max-w-[728px] mx-auto';
      case 'rectangle':
        return 'min-h-[250px] w-full max-w-[336px] mx-auto';
      case 'vertical':
        return 'min-h-[600px] w-[160px] mx-auto';
      case 'auto':
      default:
        return 'min-h-[100px] w-full';
    }
  };

  const getPositionLabel = () => {
    switch (position) {
      case 'header':
        return 'Header Leaderboard';
      case 'feed':
        return 'In-Feed Banner';
      case 'listing_modal':
        return 'Listing Modal Ad';
      case 'footer':
        return 'Footer Banner';
      default:
        return 'Custom Banner';
    }
  };

  // 1. TYPE: IMMAGINE CON LINK
  if (bannerType === 'image') {
    return (
      <div
        id={`ad-container-image-${position}`}
        className={`my-4 w-full flex flex-col items-center overflow-hidden ${className}`}
      >
        <div className="w-full max-w-[728px] flex items-center justify-between text-[10px] text-stone-400 mb-1 px-1">
          <span className="uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded">
            {banner.badgeText || 'Annuncio Sponsorizzato'}
          </span>
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-stone-400 hover:text-stone-700 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>Gestisci Banner</span>
            </button>
          )}
        </div>

        <a
          href={banner.targetUrl || '#'}
          target={banner.openInNewTab !== false ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block w-full max-w-[728px] rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all group bg-stone-100"
        >
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.imageAlt || banner.name || 'Sponsor'}
              className="w-full h-auto object-cover max-h-[260px] group-hover:scale-[1.01] transition-transform duration-300"
            />
          ) : (
            <div className="p-8 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-6 h-6 text-stone-300" />
              <span>Inserisci l'URL dell'immagine nel pannello admin</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  // 2. TYPE: SOLO TESTO CON LINK
  if (bannerType === 'text') {
    return (
      <div
        id={`ad-container-text-${position}`}
        className={`my-4 w-full max-w-[728px] mx-auto ${className}`}
      >
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 shadow-xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                {banner.badgeText || 'Sponsor'}
              </span>
              <span className="text-[11px] text-stone-400">• Annuncio Consigliato</span>
            </div>

            <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
              {banner.title || banner.name}
            </h4>

            {banner.description && (
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {banner.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
            {banner.targetUrl && (
              <a
                href={banner.targetUrl}
                target={banner.openInNewTab !== false ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>{banner.ctaText || 'Scopri di più'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                title="Gestisci questo banner"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. TYPE: CODICE HTML / SCRIPT / IFRAME
  if (bannerType === 'code' && banner.customSnippet) {
    return (
      <div
        id={`ad-container-code-${position}`}
        className={`my-4 flex flex-col items-center justify-center overflow-hidden w-full ${className}`}
      >
        <div className="w-full max-w-[728px] flex items-center justify-between text-[10px] text-stone-400 mb-1 px-1">
          <span className="uppercase font-semibold tracking-wider text-stone-400">
            Annuncio Sponsorizzato
          </span>
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-stone-400 hover:text-stone-700 font-semibold inline-flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Gestisci</span>
            </button>
          )}
        </div>
        <div 
          ref={codeContainerRef}
          className="w-full max-w-[728px] overflow-hidden flex justify-center"
        />
      </div>
    );
  }

  // 4. TYPE: GOOGLE ADSENSE (PREVIEW O UFFICIALE)
  if (config.testMode) {
    return (
      <div
        id={`ad-container-adsense-${position}`}
        className={`relative my-4 overflow-hidden rounded-2xl border border-dashed border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/70 p-4 transition-all hover:border-amber-400 ${getFormatClasses()} ${className}`}
      >
        {/* Ad Header Label */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200/60 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              Google AdSense Preview
            </span>
            <span className="text-stone-500 font-normal">
              {getPositionLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              Slot: {banner.slotId || '1234567890'}
            </span>

            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] shadow-xs transition-colors"
                title="Apri pannello AdSense"
              >
                <Settings className="w-3 h-3" />
                <span>Gestisci</span>
              </button>
            )}
          </div>
        </div>

        {/* Ad Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="flex items-center gap-1.5 text-stone-700 text-xs font-bold mb-1">
            <span>{banner.name || 'Spazio Pubblicitario Google AdSense'}</span>
          </div>
          <p className="text-[11px] text-stone-500 max-w-md">
            Publisher: <code className="font-mono text-stone-700 font-semibold">{config.publisherId}</code>
            {' • '}Formato: <span className="font-semibold capitalize text-stone-700">{banner.format}</span>
          </p>
          <p className="text-[10px] text-stone-400 mt-1">
            (Modalità Anteprima attiva per l'amministratore. In produzione mostrerà i banner Google ufficiali).
          </p>
        </div>
      </div>
    );
  }

  // Official Google AdSense Tag
  return (
    <div
      id={`ad-container-adsense-live-${position}`}
      className={`my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="w-full max-w-[728px] text-right pr-2">
        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-medium">
          Annuncio Pubblicitario
        </span>
      </div>
      <ins
        ref={adRef}
        className={`adsbygoogle ${getFormatClasses()}`}
        style={{ display: 'block' }}
        data-ad-client={config.publisherId}
        data-ad-slot={banner.slotId}
        data-ad-format={banner.format || 'auto'}
        data-full-width-responsive={banner.responsive ? 'true' : 'false'}
      />
    </div>
  );
};
