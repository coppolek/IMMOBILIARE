import { Listing, RoomType, MetroLine, University } from '../types';

/**
 * Normalizes and decodes text, unescaping HTML entities and removing messy tags/CDATA
 */
export function cleanHtmlAndEntities(text: string): string {
  if (!text) return '';
  
  // Strip CDATA wrappers if present
  let cleaned = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');

  // Convert break tags to real newlines
  cleaned = cleaned.replace(/<br\s*[\/]?>/gi, '\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n\n');
  cleaned = cleaned.replace(/<\/li>/gi, '\n');

  // Strip remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&euro;/g, '€')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Clean extra whitespace while preserving paragraph breaks
  return cleaned
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Validates or normalizes an image URL.
 * Automatically upscales thumbnail URLs from Immobiliare.it (e.g. xxs-c.jpg -> m-c.jpg or l-c.jpg)
 */
function sanitizeImageUrl(url: string): string | null {
  if (!url) return null;
  let trimmed = url.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) return null;

  // If from Immobiliare CDN and is tiny thumbnail (xxs-c.jpg), upgrade to medium/large
  if (trimmed.includes('pwm.im-cdn.it/image/')) {
    trimmed = trimmed.replace('/xxs-c.jpg', '/m-c.jpg').replace('/xs-c.jpg', '/m-c.jpg');
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return null;
}

/**
 * Intelligently extracts Metro Line and Nearest Station from address/zone/title text
 */
export function inferMetroStationAndLine(text: string): { metroStation: string; metroLine: MetroLine; metroWalkingMinutes: number } {
  const lower = text.toLowerCase();

  // Yellow Line (M3)
  if (lower.includes('ripamonti') || lower.includes('vigentino') || lower.includes('fatima')) {
    return { metroStation: 'Crocetta / Brenta', metroLine: 'M3', metroWalkingMinutes: 7 };
  }
  if (lower.includes('lodi') || lower.includes('brenta') || lower.includes('benaco')) {
    return { metroStation: 'Lodi TIBB / Brenta', metroLine: 'M3', metroWalkingMinutes: 4 };
  }
  if (lower.includes('corvetto') || lower.includes('sile') || lower.includes('mincio') || lower.includes('polesine') || lower.includes('d\'agrate') || lower.includes('dagrate')) {
    return { metroStation: 'Corvetto', metroLine: 'M3', metroWalkingMinutes: 4 };
  }
  if (lower.includes('maciachini') || lower.includes('imbonati') || lower.includes('farini')) {
    return { metroStation: 'Maciachini', metroLine: 'M3', metroWalkingMinutes: 2 };
  }
  if (lower.includes('affori') || lower.includes('bruzzano') || lower.includes('casarsa') || lower.includes('martinazzoli')) {
    return { metroStation: 'Affori FN / Centro', metroLine: 'M3', metroWalkingMinutes: 6 };
  }
  if (lower.includes('centrale') || lower.includes('fara')) {
    return { metroStation: 'Centrale FS', metroLine: 'M3', metroWalkingMinutes: 3 };
  }
  if (lower.includes('repubblica') || lower.includes('porta nuova')) {
    return { metroStation: 'Repubblica', metroLine: 'M3', metroWalkingMinutes: 3 };
  }
  if (lower.includes('porta romana') || lower.includes('medaglie d\'oro') || lower.includes('crocetta')) {
    return { metroStation: 'Porta Romana', metroLine: 'M3', metroWalkingMinutes: 3 };
  }

  // Green Line (M2)
  if (lower.includes('città studi') || lower.includes('bassini') || lower.includes('ampere') || lower.includes('valvassori') || lower.includes('pacini') || lower.includes('piola')) {
    return { metroStation: 'Piola', metroLine: 'M2', metroWalkingMinutes: 3 };
  }
  if (lower.includes('lambrate') || lower.includes('porpora') || lower.includes('casoretto') || lower.includes('cambiasi')) {
    return { metroStation: 'Lambrate FS', metroLine: 'M2', metroWalkingMinutes: 4 };
  }
  if (lower.includes('cimiano') || lower.includes('monfalcone') || lower.includes('salmeggia') || lower.includes('crescenzago') || lower.includes('paruta')) {
    return { metroStation: 'Cimiano', metroLine: 'M2', metroWalkingMinutes: 4 };
  }
  if (lower.includes('famagosta') || lower.includes('abbiategrasso') || lower.includes('chiesa rossa') || lower.includes('valla') || lower.includes('volvinio') || lower.includes('cermenate') || lower.includes('ponti') || lower.includes('barona')) {
    return { metroStation: 'Abbiategrasso / Famagosta', metroLine: 'M2', metroWalkingMinutes: 5 };
  }
  if (lower.includes('romolo') || lower.includes('bocconi') || lower.includes('san mansueto') || lower.includes('meda') || lower.includes('brioschi') || lower.includes('pezzotti')) {
    return { metroStation: 'Romolo / Tibaldi', metroLine: 'M2', metroWalkingMinutes: 6 };
  }
  if (lower.includes('garibaldi') || lower.includes('isola')) {
    return { metroStation: 'Garibaldi FS', metroLine: 'M2', metroWalkingMinutes: 3 };
  }

  // Red Line (M1)
  if (lower.includes('pasteur') || lower.includes('transiti') || lower.includes('rovereto') || lower.includes('bolzano') || lower.includes('turro') || lower.includes('leoncavallo') || lower.includes('trotter')) {
    return { metroStation: 'Pasteur / Rovereto', metroLine: 'M1', metroWalkingMinutes: 3 };
  }
  if (lower.includes('de angeli') || lower.includes('gambara') || lower.includes('poggibonsi') || lower.includes('brescia') || lower.includes('frua') || lower.includes('gracchi')) {
    return { metroStation: 'De Angeli / Gambara', metroLine: 'M1', metroWalkingMinutes: 4 };
  }
  if (lower.includes('san siro') || lower.includes('falterona') || lower.includes('civitali') || lower.includes('zoia') || lower.includes('baggio')) {
    return { metroStation: 'San Siro Stadio', metroLine: 'M5', metroWalkingMinutes: 6 };
  }

  // Blue Line (M4)
  if (lower.includes('argonne') || lower.includes('corsica') || lower.includes('smareglia') || lower.includes('forlanini') || lower.includes('ortica') || lower.includes('tucidide') || lower.includes('faustino') || lower.includes('rubattino')) {
    return { metroStation: 'Argonne M4 / Ortica', metroLine: 'M4', metroWalkingMinutes: 5 };
  }

  // Purple Line (M5)
  if (lower.includes('bovisa') || lower.includes('cosenz') || lower.includes('dergano') || lower.includes('guerzoni') || lower.includes('legnone')) {
    return { metroStation: 'Dergano / Bovisa FN', metroLine: 'M3', metroWalkingMinutes: 4 };
  }
  if (lower.includes('bicocca') || lower.includes('sarca') || lower.includes('prato centenaro') || lower.includes('lissoni') || lower.includes('bignami') || lower.includes('ponale') || lower.includes('stefini') || lower.includes('maggiolina') || lower.includes('cagliero')) {
    return { metroStation: 'Bicocca / Ca\' Granda', metroLine: 'M5', metroWalkingMinutes: 4 };
  }

  // Default fallback
  return { metroStation: 'Centrale / Duomo', metroLine: 'M3', metroWalkingMinutes: 5 };
}

/**
 * Normalizes zone names extracted from Milano real estate listings
 */
export function normalizeMilanZone(rawZone: string, title: string): string {
  const combined = (rawZone + ' ' + title).toLowerCase();

  if (combined.includes('città studi') || combined.includes('piola') || combined.includes('bassini') || combined.includes('ampere')) return 'Città Studi / Piola';
  if (combined.includes('porta romana') || combined.includes('medaglie d\'oro') || combined.includes('crocetta') || combined.includes('bocconi')) return 'Porta Romana / Crocetta';
  if (combined.includes('navigli') || combined.includes('porta genova') || combined.includes('ticinese') || combined.includes('san gottardo') || combined.includes('darsena') || combined.includes('alessi') || combined.includes('ferrari')) return 'Navigli / Porta Genova';
  if (combined.includes('isola') || combined.includes('garibaldi') || combined.includes('porta nuova') || combined.includes('repubblica')) return 'Isola / Garibaldi';
  if (combined.includes('lambrate') || combined.includes('nolo') || combined.includes('casoretto') || combined.includes('porpora')) return 'Lambrate / NoLo';
  if (combined.includes('dergano') || combined.includes('bovisa') || combined.includes('cosenz') || combined.includes('farini') || combined.includes('maciachini') || combined.includes('arimondi')) return 'Bovisa / Dergano';
  if (combined.includes('corvetto') || combined.includes('lodi') || combined.includes('brenta') || combined.includes('insubria') || combined.includes('martini') || combined.includes('puglie') || combined.includes('farsaglia') || combined.includes('sebino')) return 'Corvetto / Lodi TIBB';
  if (combined.includes('vigentino') || combined.includes('ripamonti') || combined.includes('chiaravalle') || combined.includes('quintosole')) return 'Ripamonti / Vigentino';
  if (combined.includes('chiesa rossa') || combined.includes('cermenate') || combined.includes('abbiategrasso') || combined.includes('barona') || combined.includes('famagosta')) return 'Famagosta / Barona';
  if (combined.includes('san siro') || combined.includes('de angeli') || combined.includes('gambara') || combined.includes('giambellino') || combined.includes('gonin') || combined.includes('tolstoj') || combined.includes('piazza napoli') || combined.includes('bruzzesi')) return 'San Siro / De Angeli';
  if (combined.includes('bicocca') || combined.includes('greco') || combined.includes('sarca') || combined.includes('maggiolina') || combined.includes('prato centenaro')) return 'Bicocca / Greco';
  if (combined.includes('ortica') || combined.includes('rubattino') || combined.includes('tucidide') || combined.includes('argonne')) return 'Città Studi / Ortica';
  if (combined.includes('bruzzano') || combined.includes('quarto oggiaro') || combined.includes('mambretti')) return 'Bruzzano / Affori';
  if (combined.includes('cimiano') || combined.includes('crescenzago') || combined.includes('salmeggia')) return 'Cimiano / Crescenzago';
  if (combined.includes('pasteur') || combined.includes('rovereto') || combined.includes('turro')) return 'Loreto / Pasteur';

  return rawZone.trim() || 'Milano';
}

/**
 * Parses CSV text into Listing objects with robust handling of:
 * - Italian and English column names (including Immobiliare.it export headers)
 * - Title & clean multi-line description
 * - Image URLs (singular or multiple)
 * - Floor, elevator, balcony, surface, agency, and exact address
 */
export function parseCSVToListings(csvContent: string): { listings: Listing[]; errors: string[] } {
  const lines = parseCSVRows(csvContent);
  if (lines.length < 2) {
    return { listings: [], errors: ['Il file CSV è vuoto o contiene solo l\'intestazione.'] };
  }

  const rawHeaders = lines[0];
  // Normalize headers: strip quotes, parentheses, brackets, currency symbols, and whitespace
  const headers = rawHeaders.map(h => 
    h.trim().toLowerCase().replace(/['"()\[\]€\s_\-\/\\.]+/g, '')
  );
  
  const listings: Listing[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (!values || values.length === 0 || values.every(v => !v.trim())) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ? values[idx].trim() : '';
    });

    // Check if title or price exists (skip purely blank rows)
    const rawTitle = row['titolodellannuncio'] || row['titolo'] || row['title'] || row['heading'] || row['name'] || row['nome'] || '';
    const priceStr = row['prezzoeur'] || row['prezzo'] || row['price'] || row['canone'] || row['cost'] || row['affitto'] || '';

    if (!rawTitle && !priceStr) {
      continue; // Skip blank rows
    }

    const title = cleanHtmlAndEntities(rawTitle).slice(0, 160) || `Alloggio Milano #${i}`;

    // 1. EXTRACT & CLEAN DESCRIPTION
    let rawDesc = row['descrizione'] || row['description'] || row['desc'] || row['testo'] || row['details'] || row['dettagli'] || row['body'] || '';
    
    // Extract property specs
    const surfaceM2 = row['superficiem²'] || row['superficie'] || row['mq'] || row['sqm'] || '';
    const roomsCount = row['numerodilocali'] || row['locali'] || row['rooms'] || '';
    const floor = row['piano'] || row['floor'] || '';
    const agencyName = cleanHtmlAndEntities(row['agenzia'] || row['agency'] || row['authorname'] || row['proprietario'] || row['nome'] || '');
    const listingUrl = row['urldellannuncio'] || row['url'] || row['link'] || '';
    
    // Elevator and Balcony
    const rawElevator = (row['ascensore'] || row['elevator'] || '').toLowerCase();
    const hasElevator = rawElevator === 'sì' || rawElevator === 'si' || rawElevator === 'yes' || rawElevator === 'true' || rawElevator === '1';

    const rawBalcony = (row['balcone'] || row['balcony'] || '').toLowerCase();
    const hasBalcony = rawBalcony === 'sì' || rawBalcony === 'si' || rawBalcony === 'yes' || rawBalcony === 'true' || rawBalcony === '1';

    const rawFurnished = (row['arredato'] || row['furnished'] || '').toLowerCase();
    const isFurnished = rawFurnished === 'sì' || rawFurnished === 'si' || rawFurnished === 'yes' || rawFurnished === 'true' || rawFurnished === '1';

    // If description is empty, build a rich, informative description from the metadata!
    if (!rawDesc) {
      const parts: string[] = [];
      parts.push(`Proponiamo in locazione ${title.toLowerCase()}.`);
      if (surfaceM2) parts.push(`Superficie commerciale: circa ${surfaceM2} m².`);
      if (floor !== '') parts.push(`Situato al piano ${floor === '0' ? 'terra' : `${floor}°`}${hasElevator ? ' servito da ascensore' : ''}.`);
      if (hasBalcony) parts.push('Dotato di piacevole balcone.');
      if (isFurnished) parts.push('L\'immobile viene consegnato completamente arredato.');
      if (agencyName) parts.push(`Annuncio gestito da: ${agencyName}.`);
      rawDesc = parts.join(' ');
    }

    const description = cleanHtmlAndEntities(rawDesc);

    // 2. EXTRACT & PARSE IMAGES
    const rawPhotos = row['immagineprincipale'] || row['immagine'] || row['immagini'] || row['photos'] || row['foto'] || row['images'] || row['image'] || row['photo'] || row['fotourl'] || row['imageurl'] || '';
    let parsedPhotos: string[] = [];
    if (rawPhotos) {
      const chunks = rawPhotos.split(/[|;\n]+/).flatMap(c => c.split(','));
      for (const chunk of chunks) {
        const sanitized = sanitizeImageUrl(chunk);
        if (sanitized && !parsedPhotos.includes(sanitized)) {
          parsedPhotos.push(sanitized);
        }
      }
    }

    if (parsedPhotos.length === 0) {
      parsedPhotos = [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
      ];
    }

    // 3. PRICE
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 650;

    // 4. ROOM TYPE
    let roomType: RoomType = 'monolocale';
    const rawType = (row['tipologia'] || row['tipo'] || row['roomtype'] || row['type'] || title).toLowerCase();
    if (rawType.includes('singola') || rawType.includes('camera')) roomType = 'singola';
    else if (rawType.includes('doppia')) roomType = 'doppia';
    else if (rawType.includes('bilocale')) roomType = 'bilocale';
    else if (rawType.includes('trilocale') || rawType.includes('quadrilocale') || rawType.includes('appartamento')) roomType = 'bilocale';
    else if (rawType.includes('posto') || rawType.includes('letto')) roomType = 'posto_letto';
    else if (rawType.includes('monolocale') || rawType.includes('loft') || rawType.includes('mansarda') || rawType.includes('studio')) roomType = 'monolocale';
    else if (roomsCount === '1') roomType = 'monolocale';
    else if (roomsCount === '2') roomType = 'bilocale';

    // 5. ZONE & ADDRESS EXTRACTION
    // Example title: "Monolocale via Giuseppe Ripamonti 194, Vigentino - Fatima, Milano"
    let address = '';
    let rawZone = '';
    if (title.includes(',')) {
      const parts = title.split(',');
      address = parts[0].trim().replace(/^(monolocale|bilocale|trilocale|quadrilocale|appartamento|loft|mansarda)\s+/i, '');
      if (parts.length > 1) {
        rawZone = parts[1].replace(/milano/gi, '').trim();
      }
    } else {
      address = title;
      rawZone = title;
    }

    const zone = normalizeMilanZone(rawZone, title);
    const { metroStation, metroLine, metroWalkingMinutes } = inferMetroStationAndLine(`${address} ${zone} ${title}`);

    // Author
    const authorName = agencyName || 'Membro Affitti Milano';
    const landlordType = agencyName.toLowerCase().includes('proprietario') ? 'Privato' : (agencyName ? 'Agenzia' : 'Privato');

    const listing: Listing = {
      id: `file-listing-${i}`,
      title,
      roomType,
      price,
      billsIncluded: false,
      billsEstimate: 70,
      depositMonths: 2,
      zone,
      address: address ? `${address}, Milano` : `${zone}, Milano`,
      metroStation,
      metroLine,
      metroWalkingMinutes,
      availableFrom: 'Subito',
      minStayMonths: 6,
      photos: parsedPhotos,
      description,
      contractType: 'Transitorio Studenti',
      landlordType,
      authorName,
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      authorFbProfileUrl: listingUrl || undefined,
      externalListingUrl: listingUrl || undefined,
      source: listingUrl.includes('immobiliare.it') ? 'immobiliare' : listingUrl ? 'diretto' : 'facebook',
      verified: true,
      targetUniversities: ['PoliMi Leonardo', 'Bocconi', 'Statale (Festa del Perdono)'],
      amenities: {
        wifi: true,
        desk: true,
        washingMachine: true,
        balcony: hasBalcony,
        airConditioning: description.toLowerCase().includes('aria condizionata') || description.toLowerCase().includes('climatizzat'),
        elevator: hasElevator,
        privateBathroom: true,
        dishwasher: false,
      },
      genderPreference: 'tutti',
      createdAt: 'Importato da CSV',
    };

    listings.push(listing);
  }

  return { listings, errors };
}

/**
 * Standard RFC 4180 CSV parser supporting quoted newlines, escaped quotes ("") and comma/semicolon auto-detection
 */
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Auto-detect delimiter from first line (before quote processing)
  const firstLineBreak = csvText.indexOf('\n');
  const firstLine = firstLineBreak !== -1 ? csvText.substring(0, firstLineBreak) : csvText;
  const separator = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Skip \n in \r\n
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 0 && currentRow.some(c => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(c => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses XML/RSS string into Listing objects with robust:
 * - CDATA unescaping
 * - <media:content>, <enclosure>, <media:thumbnail> and embedded HTML <img> extraction
 * - Clean title & multi-line description parsing
 */
export function parseRSSToListings(xmlString: string): { listings: Listing[]; errors: string[] } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const parseErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      return { listings: [], errors: ['Documento XML/RSS non valido o malformato.'] };
    }

    let items = Array.from(xmlDoc.getElementsByTagName('item'));
    if (items.length === 0) {
      items = Array.from(xmlDoc.getElementsByTagName('entry'));
    }

    if (items.length === 0) {
      return { listings: [], errors: ['Nessun elemento <item> o <entry> trovato nel feed RSS.'] };
    }

    const listings: Listing[] = [];

    items.forEach((item, idx) => {
      const getVal = (tagName: string): string => {
        const el = item.getElementsByTagName(tagName)[0];
        return el ? el.textContent || '' : '';
      };

      const rawTitle = getVal('title') || `Annuncio RSS #${idx + 1}`;
      const title = cleanHtmlAndEntities(rawTitle).slice(0, 160) || `Annuncio Alloggio #${idx + 1}`;

      const rawDesc = getVal('description') || 
                      getVal('content:encoded') || 
                      getVal('content') || 
                      getVal('summary') || 
                      '';
      const description = cleanHtmlAndEntities(rawDesc) || 'Annuncio alloggio sincronizzato tramite feed RSS.';

      const images: string[] = [];

      const enclosures = Array.from(item.getElementsByTagName('enclosure'));
      for (const enc of enclosures) {
        const url = enc.getAttribute('url');
        const type = enc.getAttribute('type') || '';
        if (url && (type.startsWith('image') || /\.(jpe?g|png|webp|avif|gif)/i.test(url))) {
          const sanitized = sanitizeImageUrl(url);
          if (sanitized && !images.includes(sanitized)) images.push(sanitized);
        }
      }

      const mediaContents = Array.from(item.getElementsByTagNameNS('*', 'content'));
      for (const mc of mediaContents) {
        const url = mc.getAttribute('url');
        const medium = mc.getAttribute('medium');
        if (url && (medium === 'image' || /\.(jpe?g|png|webp|avif|gif)/i.test(url))) {
          const sanitized = sanitizeImageUrl(url);
          if (sanitized && !images.includes(sanitized)) images.push(sanitized);
        }
      }

      const thumbnails = Array.from(item.getElementsByTagNameNS('*', 'thumbnail'));
      for (const tb of thumbnails) {
        const url = tb.getAttribute('url');
        if (url) {
          const sanitized = sanitizeImageUrl(url);
          if (sanitized && !images.includes(sanitized)) images.push(sanitized);
        }
      }

      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = imgRegex.exec(rawDesc)) !== null) {
        const url = match[1];
        if (url && !url.includes('spacer.gif') && !url.includes('1x1')) {
          const sanitized = sanitizeImageUrl(url);
          if (sanitized && !images.includes(sanitized)) images.push(sanitized);
        }
      }

      if (images.length === 0) {
        images.push(
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
        );
      }

      const fullText = (title + ' ' + description).toLowerCase();

      const priceMatch = (title + ' ' + description).match(/(?:€\s*|euro\s*|canone\s*|affitto\s*|prezzo\s*)(\d{3,4})|(\d{3,4})\s*(?:€|euro)/i);
      let price = 650;
      if (priceMatch) {
        price = parseInt(priceMatch[1] || priceMatch[2], 10);
      }

      let roomType: RoomType = 'singola';
      if (fullText.includes('doppia')) roomType = 'doppia';
      else if (fullText.includes('monolocale') || fullText.includes('studio')) roomType = 'monolocale';
      else if (fullText.includes('bilocale') || fullText.includes('trilocale')) roomType = 'bilocale';
      else if (fullText.includes('posto letto') || fullText.includes('posto-letto')) roomType = 'posto_letto';

      const zone = normalizeMilanZone('', title + ' ' + description);
      const { metroStation, metroLine, metroWalkingMinutes } = inferMetroStationAndLine(title + ' ' + description);

      const authorName = cleanHtmlAndEntities(
        getVal('dc:creator') || 
        getVal('author') || 
        item.getElementsByTagName('author')[0]?.getElementsByTagName('name')[0]?.textContent || 
        'Feed RSS'
      );

      const listing: Listing = {
        id: `rss-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        roomType,
        price,
        billsIncluded: fullText.includes('spese incluse') || fullText.includes('bollette incluse'),
        billsEstimate: 70,
        depositMonths: 2,
        zone,
        address: `${zone}, Milano`,
        metroStation,
        metroLine,
        metroWalkingMinutes,
        availableFrom: 'Subito',
        minStayMonths: 6,
        photos: images,
        description,
        contractType: 'Transitorio Studenti',
        landlordType: 'Privato',
        authorName: authorName || 'Feed RSS Community',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: true,
        targetUniversities: ['PoliMi Leonardo', 'Statale (Festa del Perdono)'],
        amenities: {
          wifi: true,
          desk: true,
          washingMachine: true,
          balcony: fullText.includes('balcone'),
          airConditioning: fullText.includes('aria condizionata') || fullText.includes('clima'),
          elevator: true,
          privateBathroom: fullText.includes('bagno privato'),
          dishwasher: false,
        },
        genderPreference: 'tutti',
        createdAt: cleanHtmlAndEntities(getVal('pubDate') || getVal('updated') || 'Importato da RSS'),
      };

      listings.push(listing);
    });

    return { listings, errors: [] };
  } catch (err: any) {
    return { listings: [], errors: [err.message || 'Errore durante la decodifica del feed RSS.'] };
  }
}
