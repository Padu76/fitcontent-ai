import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { mediaUrl, mediaType, reelNumber, totalReels, seriesTitle } = await request.json();

    console.log('=== ANALYZE REQUEST START ===');
    console.log('Media URL:', mediaUrl);
    console.log('Media Type:', mediaType);
    console.log('Reel Info:', { reelNumber, totalReels, seriesTitle });

    if (!mediaUrl) {
      return Response.json({ error: 'URL media mancante' }, { status: 400 });
    }

    // Costruisci context per reel consecutivi
    let reelContext = '';
    if (reelNumber && totalReels) {
      if (totalReels > 1) {
        if (reelNumber === 1) {
          reelContext = `
IMPORTANTE: Questa è la PARTE ${reelNumber} di ${totalReels} di una serie di reel consecutivi${seriesTitle ? ` intitolata "${seriesTitle}"` : ''}.
- Questo è il PRIMO reel della serie
- Crea una caption che INTRODUCE il contenuto e crea aspettativa per le prossime parti
- Usa frasi come "Iniziamo con...", "Prima parte...", "Swipe per vedere il resto"
- Mantieni un tono che invita a guardare i prossimi reel
`;
        } else if (reelNumber === totalReels) {
          reelContext = `
IMPORTANTE: Questa è la PARTE ${reelNumber} di ${totalReels} di una serie di reel consecutivi${seriesTitle ? ` intitolata "${seriesTitle}"` : ''}.
- Questo è l'ULTIMO reel della serie
- Crea una caption che CONCLUDE il contenuto iniziato nei reel precedenti
- Usa frasi come "E per finire...", "Ultima parte...", "Ricapitolando..."
- Aggiungi una CTA forte per engagement (commenti, salva, condividi)
`;
        } else {
          reelContext = `
IMPORTANTE: Questa è la PARTE ${reelNumber} di ${totalReels} di una serie di reel consecutivi${seriesTitle ? ` intitolata "${seriesTitle}"` : ''}.
- Questo è un reel INTERMEDIO della serie
- Crea una caption che CONTINUA il contenuto iniziato nel reel precedente
- Usa frasi come "Continuiamo con...", "Ora vediamo...", "Prossimo step..."
- Mantieni la continuità narrativa senza ripetere informazioni già date
`;
        }
      } else {
        reelContext = `Questo è un singolo reel${seriesTitle ? ` intitolato "${seriesTitle}"` : ''}.`;
      }
    }

    const prompt = `Sei un esperto copywriter per personal trainer e coach fitness.

Analizza questa immagine e genera contenuti Instagram in ITALIANO.

${reelContext}

L'immagine può mostrare:
- Esercizi e allenamenti
- Pasti e nutrizione fitness
- Trasformazioni fisiche
- Lifestyle fitness e wellness

IMPORTANTE: Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, markdown o spiegazioni.

${totalReels > 1 ? `
CONTINUITÀ TRA REEL:
- Se è il primo reel: crea suspense e anticipa cosa verrà dopo
- Se è un reel intermedio: richiama brevemente il contesto e prosegui
- Se è l'ultimo reel: chiudi con un recap e una CTA potente
- NON ripetere informazioni già date nei reel precedenti
- Mantieni un filo narrativo coerente
` : ''}

Struttura JSON richiesta:
{
  "description": "descrizione breve del contenuto mostrato (max 30 parole)",
  "variants": [
    {
      "type": "motivazionale",
      "caption": "caption coinvolgente con emoji (max 200 parole)${totalReels > 1 ? ', adattata alla posizione nella serie' : ''}",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    },
    {
      "type": "educativo",
      "caption": "caption educativa con emoji (max 200 parole)${totalReels > 1 ? ', adattata alla posizione nella serie' : ''}",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    },
    {
      "type": "promozionale",
      "caption": "caption promozionale con emoji (max 200 parole)${totalReels > 1 ? ', adattata alla posizione nella serie' : ''}",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    }
  ]
}

Scrivi in tono professionale ma amichevole.`;

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { 
              url: mediaUrl,
              detail: "low"
            }
          }
        ]
      }
    ];

    console.log('Chiamata OpenAI GPT-4o Vision...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    console.log('Risposta ricevuta');

    const content = response.choices[0].message.content;
    const refusal = response.choices[0].message.refusal;
    
    if (refusal) {
      console.error('GPT-4o ha rifiutato:', refusal);
      return Response.json({ 
        error: 'Contenuto non analizzabile',
        details: 'L\'immagine potrebbe contenere contenuto non supportato dai filtri di sicurezza'
      }, { status: 400 });
    }

    if (!content) {
      console.error('Content è null o vuoto');
      console.error('Finish reason:', response.choices[0].finish_reason);
      return Response.json({ 
        error: 'GPT-4o non ha generato contenuto',
        details: `Finish reason: ${response.choices[0].finish_reason}`
      }, { status: 500 });
    }

    console.log('Content lunghezza:', content.length);
    
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\n?/g, '');
    cleanContent = cleanContent.replace(/```\n?/g, '');
    cleanContent = cleanContent.trim();

    console.log('Parsing JSON...');
    const result = JSON.parse(cleanContent);

    console.log('Analisi completata con successo');
    return Response.json({ success: true, data: result });

  } catch (error) {
    console.error('=== ERRORE ANALISI ===');
    console.error('Tipo errore:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Stack:', error.stack);
    
    return Response.json({ 
      error: 'Errore durante analisi', 
      details: error.message 
    }, { status: 500 });
  }
}