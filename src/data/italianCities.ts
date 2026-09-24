export interface ItalianCity {
  name: string;
  provinceCode: string;
  region: string;
  isMajor?: boolean;
}

// Complete list of all 107 Italian Provincial Capitals (Capoluoghi di provincia e città metropolitane)
export const ALL_CAPOLUOGHI: ItalianCity[] = [
  // Abruzzo
  { name: "L'Aquila", provinceCode: "AQ", region: "Abruzzo" },
  { name: "Chieti", provinceCode: "CH", region: "Abruzzo" },
  { name: "Pescara", provinceCode: "PE", region: "Abruzzo" },
  { name: "Teramo", provinceCode: "TE", region: "Abruzzo" },

  // Basilicata
  { name: "Potenza", provinceCode: "PZ", region: "Basilicata" },
  { name: "Matera", provinceCode: "MT", region: "Basilicata" },

  // Calabria
  { name: "Catanzaro", provinceCode: "CZ", region: "Calabria" },
  { name: "Cosenza", provinceCode: "CS", region: "Calabria" },
  { name: "Crotone", provinceCode: "KR", region: "Calabria" },
  { name: "Reggio Calabria", provinceCode: "RC", region: "Calabria" },
  { name: "Vibo Valentia", provinceCode: "VV", region: "Calabria" },

  // Campania
  { name: "Napoli", provinceCode: "NA", region: "Campania", isMajor: true },
  { name: "Avellino", provinceCode: "AV", region: "Campania" },
  { name: "Benevento", provinceCode: "BN", region: "Campania" },
  { name: "Caserta", provinceCode: "CE", region: "Campania" },
  { name: "Salerno", provinceCode: "SA", region: "Campania", isMajor: true },

  // Emilia-Romagna
  { name: "Bologna", provinceCode: "BO", region: "Emilia-Romagna", isMajor: true },
  { name: "Ferrara", provinceCode: "FE", region: "Emilia-Romagna" },
  { name: "Forlì", provinceCode: "FC", region: "Emilia-Romagna" },
  { name: "Cesena", provinceCode: "FC", region: "Emilia-Romagna" },
  { name: "Modena", provinceCode: "MO", region: "Emilia-Romagna", isMajor: true },
  { name: "Parma", provinceCode: "PR", region: "Emilia-Romagna", isMajor: true },
  { name: "Piacenza", provinceCode: "PC", region: "Emilia-Romagna" },
  { name: "Ravenna", provinceCode: "RA", region: "Emilia-Romagna" },
  { name: "Reggio Emilia", provinceCode: "RE", region: "Emilia-Romagna" },
  { name: "Rimini", provinceCode: "RN", region: "Emilia-Romagna" },

  // Friuli-Venezia Giulia
  { name: "Trieste", provinceCode: "TS", region: "Friuli-Venezia Giulia", isMajor: true },
  { name: "Gorizia", provinceCode: "GO", region: "Friuli-Venezia Giulia" },
  { name: "Pordenone", provinceCode: "PN", region: "Friuli-Venezia Giulia" },
  { name: "Udine", provinceCode: "UD", region: "Friuli-Venezia Giulia" },

  // Lazio
  { name: "Roma", provinceCode: "RM", region: "Lazio", isMajor: true },
  { name: "Frosinone", provinceCode: "FR", region: "Lazio" },
  { name: "Latina", provinceCode: "LT", region: "Lazio" },
  { name: "Rieti", provinceCode: "RI", region: "Lazio" },
  { name: "Viterbo", provinceCode: "VT", region: "Lazio" },

  // Liguria
  { name: "Genova", provinceCode: "GE", region: "Liguria", isMajor: true },
  { name: "Imperia", provinceCode: "IM", region: "Liguria" },
  { name: "La Spezia", provinceCode: "SP", region: "Liguria" },
  { name: "Savona", provinceCode: "SV", region: "Liguria" },

  // Lombardia
  { name: "Milano", provinceCode: "MI", region: "Lombardia", isMajor: true },
  { name: "Bergamo", provinceCode: "BG", region: "Lombardia", isMajor: true },
  { name: "Brescia", provinceCode: "BS", region: "Lombardia", isMajor: true },
  { name: "Como", provinceCode: "CO", region: "Lombardia" },
  { name: "Cremona", provinceCode: "CR", region: "Lombardia" },
  { name: "Lecco", provinceCode: "LC", region: "Lombardia" },
  { name: "Lodi", provinceCode: "LO", region: "Lombardia" },
  { name: "Mantova", provinceCode: "MN", region: "Lombardia" },
  { name: "Monza", provinceCode: "MB", region: "Lombardia", isMajor: true },
  { name: "Pavia", provinceCode: "PV", region: "Lombardia", isMajor: true },
  { name: "Sondrio", provinceCode: "SO", region: "Lombardia" },
  { name: "Varese", provinceCode: "VA", region: "Lombardia" },

  // Marche
  { name: "Ancona", provinceCode: "AN", region: "Marche" },
  { name: "Ascoli Piceno", provinceCode: "AP", region: "Marche" },
  { name: "Fermo", provinceCode: "FM", region: "Marche" },
  { name: "Macerata", provinceCode: "MC", region: "Marche" },
  { name: "Pesaro", provinceCode: "PU", region: "Marche" },
  { name: "Urbino", provinceCode: "PU", region: "Marche" },

  // Molise
  { name: "Campobasso", provinceCode: "CB", region: "Molise" },
  { name: "Isernia", provinceCode: "IS", region: "Molise" },

  // Piemonte
  { name: "Torino", provinceCode: "TO", region: "Piemonte", isMajor: true },
  { name: "Alessandria", provinceCode: "AL", region: "Piemonte" },
  { name: "Asti", provinceCode: "AT", region: "Piemonte" },
  { name: "Biella", provinceCode: "BI", region: "Piemonte" },
  { name: "Cuneo", provinceCode: "CN", region: "Piemonte" },
  { name: "Novara", provinceCode: "NO", region: "Piemonte" },
  { name: "Verbania", provinceCode: "VB", region: "Piemonte" },
  { name: "Vercelli", provinceCode: "VC", region: "Piemonte" },

  // Puglia
  { name: "Bari", provinceCode: "BA", region: "Puglia", isMajor: true },
  { name: "Andria", provinceCode: "BT", region: "Puglia" },
  { name: "Barletta", provinceCode: "BT", region: "Puglia" },
  { name: "Trani", provinceCode: "BT", region: "Puglia" },
  { name: "Brindisi", provinceCode: "BR", region: "Puglia" },
  { name: "Foggia", provinceCode: "FG", region: "Puglia" },
  { name: "Lecce", provinceCode: "LE", region: "Puglia", isMajor: true },
  { name: "Taranto", provinceCode: "TA", region: "Puglia" },

  // Sardegna
  { name: "Cagliari", provinceCode: "CA", region: "Sardegna", isMajor: true },
  { name: "Nuoro", provinceCode: "NU", region: "Sardegna" },
  { name: "Oristano", provinceCode: "OR", region: "Sardegna" },
  { name: "Sassari", provinceCode: "SS", region: "Sardegna" },

  // Sicilia
  { name: "Palermo", provinceCode: "PA", region: "Sicilia", isMajor: true },
  { name: "Agrigento", provinceCode: "AG", region: "Sicilia" },
  { name: "Caltanissetta", provinceCode: "CL", region: "Sicilia" },
  { name: "Catania", provinceCode: "CT", region: "Sicilia", isMajor: true },
  { name: "Enna", provinceCode: "EN", region: "Sicilia" },
  { name: "Messina", provinceCode: "ME", region: "Sicilia" },
  { name: "Ragusa", provinceCode: "RG", region: "Sicilia" },
  { name: "Siracusa", provinceCode: "SR", region: "Sicilia" },
  { name: "Trapani", provinceCode: "TP", region: "Sicilia" },

  // Toscana
  { name: "Firenze", provinceCode: "FI", region: "Toscana", isMajor: true },
  { name: "Arezzo", provinceCode: "AR", region: "Toscana" },
  { name: "Grosseto", provinceCode: "GR", region: "Toscana" },
  { name: "Livorno", provinceCode: "LI", region: "Toscana" },
  { name: "Lucca", provinceCode: "LU", region: "Toscana" },
  { name: "Massa", provinceCode: "MS", region: "Toscana" },
  { name: "Pisa", provinceCode: "PI", region: "Toscana", isMajor: true },
  { name: "Pistoia", provinceCode: "PT", region: "Toscana" },
  { name: "Prato", provinceCode: "PO", region: "Toscana" },
  { name: "Siena", provinceCode: "SI", region: "Toscana", isMajor: true },

  // Trentino-Alto Adige
  { name: "Trento", provinceCode: "TN", region: "Trentino-Alto Adige", isMajor: true },
  { name: "Bolzano", provinceCode: "BZ", region: "Trentino-Alto Adige", isMajor: true },

  // Umbria
  { name: "Perugia", provinceCode: "PG", region: "Umbria", isMajor: true },
  { name: "Terni", provinceCode: "TR", region: "Umbria" },

  // Valle d'Aosta
  { name: "Aosta", provinceCode: "AO", region: "Valle d'Aosta" },

  // Veneto
  { name: "Venezia", provinceCode: "VE", region: "Veneto", isMajor: true },
  { name: "Belluno", provinceCode: "BL", region: "Veneto" },
  { name: "Padova", provinceCode: "PD", region: "Veneto", isMajor: true },
  { name: "Rovigo", provinceCode: "RO", region: "Veneto" },
  { name: "Treviso", provinceCode: "TV", region: "Veneto" },
  { name: "Verona", provinceCode: "VR", region: "Veneto", isMajor: true },
  { name: "Vicenza", provinceCode: "VI", region: "Veneto" },
];

export const POPULAR_CAPOLUOGHI = [
  'Milano',
  'Roma',
  'Bologna',
  'Torino',
  'Firenze',
  'Napoli',
  'Padova',
  'Pisa',
  'Genova',
  'Bari',
  'Palermo',
  'Verona',
];

// Helper to get city details
export function getCityDetails(cityName: string): ItalianCity | undefined {
  if (!cityName) return undefined;
  const normalized = cityName.trim().toLowerCase();
  return ALL_CAPOLUOGHI.find(c => c.name.toLowerCase() === normalized);
}

// Helper to group by region
export const CITIES_BY_REGION = ALL_CAPOLUOGHI.reduce((acc, city) => {
  if (!acc[city.region]) {
    acc[city.region] = [];
  }
  acc[city.region].push(city);
  return acc;
}, {} as Record<string, ItalianCity[]>);
