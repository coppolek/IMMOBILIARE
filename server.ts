import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy GoogleGenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    group: 'https://www.facebook.com/groups/477013955229676',
    groupId: '477013955229676',
    community: 'Affitti Milano - Stanze, Monolocali, Appartamenti',
  });
});

// API: AI Scam & Red Flag Detector
app.post('/api/analyze-listing', async (req, res) => {
  try {
    const { text, price, zone, roomType, depositMonths } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required for scam analysis.' });
    }

    const ai = getGenAI();
    if (ai) {
      const prompt = `You are an expert Milan (Italy) rental market investigator and anti-scam advisor for the Facebook housing group "Affitti Milano" (ID 477013955229676).
Analyze the following housing offer, message, or chat snippet for potential scams, predatory terms, or red flags.

CONTEXT OF MILAN RENTAL SCAMS:
- Fake landlords claiming to work abroad (e.g., in the UK, for UNESCO, military, doctor) who cannot do in-person viewings.
- Asking for wire transfer (Western Union, MoneyGram, Ria, direct IBAN to foreign countries, or fake Airbnb / TripAdvisor booking links) BEFORE visiting the apartment in person.
- Extremely low prices for central Milan (e.g. renovated 1-bedroom / bilocale in Duomo, Brera, Navigli, or Porta Nuova for €400-€600/month is 99% a scam; realistic single room is €600-€900, studio is €900-€1400).
- Demanding more than 3 months of security deposit ("deposito cauzionale", legally capped in Italy at 3 months, Art. 11 Legge 392/78).
- Refusal to provide Codice Fiscale, refuse regular contract (contratto registrato 4+4, 3+2 a canone concordato, or transitorio per studenti RLI Agenzia delle Entrate) or demanding "in nero" (cash only with no lease).

Input details:
- Quoted Price: ${price || 'Not specified'}
- Zone: ${zone || 'Not specified'}
- Room Type: ${roomType || 'Not specified'}
- Deposit: ${depositMonths ? depositMonths + ' months' : 'Not specified'}
- Post / Message snippet:
"""
${text}
"""

Please respond ONLY in valid JSON matching this exact schema:
{
  "riskLevel": "SAFE" | "CAUTION" | "HIGH_RISK_SCAM",
  "score": number (0 to 100, where 0 is completely legit, 100 is definite scam),
  "verdict": "string summary in Italian and English",
  "redFlags": ["list of specific warning signs detected, in Italian/English"],
  "positiveSigns": ["legit signals if any, e.g. registered contract mentioned, in-person viewing permitted"],
  "priceAssessment": "Evaluation of whether the price makes sense for this Milan zone",
  "actionAdvice": ["Concrete instructions for the student/tenant on what to verify or do next"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output', parseErr, responseText);
      }
    }

    // Heuristic fallback if AI unavailable or parse failed
    const lower = text.toLowerCase();
    const flags: string[] = [];
    let score = 15;

    if (lower.includes('airbnb') || lower.includes('tripadvisor') || lower.includes('booking.com') && (lower.includes('key') || lower.includes('chiavi') || lower.includes('link'))) {
      flags.push('Riferimento a pagamento tramite finto link Airbnb / Booking prima della visita (Truffa comune)');
      score += 45;
    }
    if (lower.includes('western union') || lower.includes('moneygram') || lower.includes('bonifico anticipato') || lower.includes('advance payment') || lower.includes('prima della visita')) {
      flags.push('Richiesta di caparra o denaro prima di aver visto l\'immobile di persona');
      score += 50;
    }
    if (lower.includes('all\'estero') || lower.includes('abroad') || lower.includes('lavoro a londra') || lower.includes('in inghilterra') || lower.includes('unesco') || lower.includes('mission')) {
      flags.push('Proprietario dichiara di essere all\'estero e impossibilitato a mostrare l\'appartamento');
      score += 35;
    }
    if (lower.includes('senza contratto') || lower.includes('in nero') || lower.includes('no registrazione')) {
      flags.push('Affitto non registrato / richiesta di pagamento in nero (illegale e privo di tutele)');
      score += 30;
    }
    if (price && Number(price) < 450 && (zone?.toLowerCase().includes('duomo') || zone?.toLowerCase().includes('navigli') || zone?.toLowerCase().includes('brera') || zone?.toLowerCase().includes('garibaldi'))) {
      flags.push('Prezzo troppo basso per la zona centrale indicata (possibile esca)');
      score += 35;
    }

    score = Math.min(100, Math.max(5, score));
    const riskLevel = score > 65 ? 'HIGH_RISK_SCAM' : score > 35 ? 'CAUTION' : 'SAFE';

    return res.json({
      riskLevel,
      score,
      verdict: riskLevel === 'HIGH_RISK_SCAM' 
        ? 'Attenzione: Rilevati forti indicatori di truffa immobiliare tipica di Milano.' 
        : riskLevel === 'CAUTION' 
        ? 'Attenzione media: Ci sono elementi da chiarire prima di versare somme o firmare.'
        : 'L\'annuncio sembra presentare caratteristiche coerenti con il mercato milanese standard.',
      redFlags: flags.length ? flags : ['Nessun segnale evidente di truffa nel testo fornito'],
      positiveSigns: lower.includes('visita') || lower.includes('contratto') ? ['Menzione di contratto o possibilità di visita'] : ['Verificare sempre di persona'],
      priceAssessment: price ? `Il canone indicato di €${price} va confrontato con le medie di zona.` : 'Canone da verificare.',
      actionAdvice: [
        'Non inviare MAI caparra o bonifico prima di visitare fisicamente l\'appartamento e verificare le chiavi.',
        'Richiedere copia della bozza di contratto registrato (Modello RLI Agenzia delle Entrate).',
        'Verificare l\'identità del locatore tramite codice fiscale e visura catastale.',
      ],
    });
  } catch (err: any) {
    console.error('Scam analysis error:', err);
    res.status(500).json({ error: err.message || 'Error running scam analysis.' });
  }
});

// API: AI Facebook Post Generator (Bilingual, high conversion for group 477013955229676)
app.post('/api/generate-fb-post', async (req, res) => {
  try {
    const {
      postType, // "cerco" (seeking) or "offro" (offering)
      name,
      role, // "Student at PoliMi Leonardo", "Worker at Porta Nuova", etc.
      roomType, // "Stanza Singola", "Monolocale", "Bilocale"
      budget,
      zones,
      moveInDate,
      duration,
      preferences, // pets, smoking, lifestyle
      extraDetails,
    } = req.body;

    const ai = getGenAI();
    if (ai) {
      const prompt = `You are an expert community manager for the Facebook group "Affitti Milano / Stanze e Appartamenti" (URL: https://www.facebook.com/groups/477013955229676).
Generate a highly engaging, polite, and effective post in BOTH Italian and English (or bilingual format popular in Milan housing groups).

PARAMETERS:
- Type: ${postType === 'offro' ? 'OFFRO CASA / STANZA (Offering accommodation)' : 'CERCO CASA / STANZA (Looking for accommodation)'}
- Poster Name: ${name || 'Ragazzo/a serio/a'}
- Role/Profile: ${role || 'Studente / Giovane lavoratore'}
- Typology: ${roomType || 'Stanza singola'}
- Budget / Canone: ${budget ? `€${budget} / mese` : 'Trattabile / In linea di mercato'}
- Preferred Zones / Location: ${zones || 'Milano (preferibilmente vicino alla Metro)'}
- Move-in Date: ${moveInDate || 'Il prima possibile / da inizio mese'}
- Duration: ${duration || 'Lungo termine o transitorio'}
- Preferences / Amenities: ${preferences || 'No fumatori, pulito, ordinato, contratto regolare'}
- Additional Notes: ${extraDetails || ''}

RULES FOR A GREAT MILAN HOUSING POST:
1. Catchy headline indicating [CERCO] or [OFFRO] + [ZONA / METRO] + [BUDGET]
2. Professional and friendly tone that builds trust with landlords and flatmates
3. Clear bullets for details (Prezzo, Spese incluse/escluse, Metro vicina, Tipologia contratto)
4. Mention the Facebook group community (477013955229676)
5. Appropriate hashtags: #AffittiMilano #StanzeMilano #PoliMi #Bocconi #Statale #MilanoRentals #CercoStanza
6. Format it with clean emojis, ready for 1-click copy-pasting.

Return ONLY a JSON object:
{
  "title": "Short title for preview",
  "facebookPostText": "Complete ready-to-copy text for Facebook",
  "tipsForSuccess": ["3 bullet tips to get faster replies on Facebook group 477013955229676"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output', parseErr);
      }
    }

    // Fallback template
    const isCerco = postType !== 'offro';
    const postText = isCerco
      ? `📢 [CERCO STANZA A MILANO] 📢
Ciao a tutti i membri del gruppo! Mi chiamo ${name || 'un ragazzo/a referenziato/a'}, ${role || 'studente / lavoratore'} a Milano.

🔍 Cerco: ${roomType || 'Stanza singola'}
📍 Zone preferite: ${zones || 'Città Studi, Lambrate, Navigli, Loreto o vicino metro'}
💶 Budget: circa €${budget || '650'} al mese (spese comprese)
📅 Disponibilità: da ${moveInDate || 'subito / prossimo mese'} per ${duration || 'almeno 1 anno'}
✅ Caratteristiche: persona ordinata, tranquilla, rispettosa degli spazi comuni, non fumatore/trice. Garanzie solide e massima serietà.
📄 Cerco con regolare contratto di locazione registrato.

🇬🇧 ENGLISH:
Hello! Looking for a ${roomType || 'single room'} in Milan.
Budget: ~€${budget || '650'}/month incl. bills. Move-in: ${moveInDate || 'ASAP'}. Very clean, tidy and quiet person. Serious guarantees provided.

📩 Scrivetemi pure in privato su Facebook o lasciate un commento con foto e dettagli! Grazie mille a tutti!

#AffittiMilano #StanzeMilano #CercoStanza #MilanoRentals #FacebookGroup477013955229676`
      : `🏠 [OFFRO ${roomType ? roomType.toUpperCase() : 'STANZA SINGOLA'} A MILANO] 🏠
Ciao a tutti! Si libera una bella ${roomType || 'stanza singola'} in appartamento condiviso a Milano.

📍 Zona: ${zones || 'Milano - vicinanze metro'}
💶 Canone: €${budget || '700'} / mese (+ spese condominiali e utenze)
🚇 Mezzi: a pochi minuti a piedi da Metro e bus
📅 Disponibilità: da ${moveInDate || 'inizio mese'}
🛋️ Dotazioni: completamente arredata, Wi-Fi fibra, lavatrice, cucina accessoriata, riscaldamento.
📄 Tipologia: Contratto regolarmente registrato all'Agenzia delle Entrate (cedolare secca).

Cerchiamo persona seria, pulita e rispettosa degli spazi comuni.

🇬🇧 ENGLISH:
Room available for rent in Milan. Furnished, quiet flat, close to metro station. Regular registered contract. Feel free to PM for info and viewings!

📩 Contattatemi in privato con una breve presentazione per organizzare una visita di persona!

#AffittiMilano #StanzaMilano #OffroStanza #MilanoApartments #FacebookGroup477013955229676`;

    return res.json({
      title: isCerco ? 'Post di ricerca stanza' : 'Post offerta alloggio',
      facebookPostText: postText,
      tipsForSuccess: [
        'Aggiungi una tua foto sorridente al post: aumenta le risposte del 300% su Facebook.',
        'Condividi subito le tue garanzie (studente universitario con garante o lavoratore con busta paga).',
        'Controlla frequentemente le notifiche e rispondi ai messaggi privati "Richieste di messaggi" su Messenger.',
      ],
    });
  } catch (err: any) {
    console.error('Post generation error:', err);
    res.status(500).json({ error: err.message || 'Error generating Facebook post.' });
  }
});

// API: AI Milan Rental Advisor & Legal Guide
app.post('/api/rental-advisor', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGenAI();
    if (ai) {
      const prompt = `You are a licensed Milan real estate expert and tenant rights advocate for Milan Facebook housing group 477013955229676.
Answer the following tenant/landlord question clearly, objectively, and accurately based on Italian tenancy law (Legge 431/98, Cedolare Secca, contratti transitori per studenti, RLI Agenzia delle Entrate, caparra cauzionale, spese condominiali, Milano zone averages):

Question: "${question}"

Provide:
1. Direct answer in friendly Italian (with key English summary)
2. Practical legal advice (what documents are required, e.g., Codice Fiscale, Permesso di Soggiorno, Contratto Registrato)
3. Average Milan benchmark / warning if applicable.

Keep your response structured, well formatted with markdown bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ answer: response.text });
    }

    return res.json({
      answer: `**Consiglio Generale per Milano:**
- **Contratto:** Richiedi sempre un contratto registrato all'Agenzia delle Entrate (Modello RLI). I più usati sono il *Canone Concordato 3+2*, il *Transitorio per Studenti* (da 6 a 36 mesi con attestazione di iscrizione all'università), o il *4+4*.
- **Cedolare Secca:** Molto conveniente perché esenta dall'imposta di registro e dal bollo per il conduttore.
- **Deposito Cauzionale:** La legge italiana (art. 11 L. 392/78) stabilisce che non può superare 3 mensilità di canone e deve maturare interessi legali se non diversamente pattuito.
- **Documenti:** Servono sempre Documento d'identità, Codice Fiscale italiano, e attestazione redditi (busta paga, CUD) o iscrizione universitaria con garanzia genitoriale.`,
    });
  } catch (err: any) {
    console.error('Rental advisor error:', err);
    res.status(500).json({ error: err.message || 'Error processing request.' });
  }
});

// API: Proxy RSS URL to bypass browser CORS restrictions
app.post('/api/fetch-rss', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AffittiMilanoBot/1.0; +https://facebook.com/groups/477013955229676)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Impossibile scaricare il feed RSS (HTTP ${response.status})` });
    }

    const xmlData = await response.text();
    res.json({ xml: xmlData });
  } catch (err: any) {
    console.error('Fetch RSS error:', err);
    res.status(500).json({ error: err.message || 'Errore nel recupero del feed RSS' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
