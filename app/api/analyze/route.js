import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { mediaUrl, mediaType } = await request.json();

    console.log('=== ANALYZE REQUEST START ===');
    console.log('Media URL:', mediaUrl);
    console.log('Media Type:', mediaType);

    if (!mediaUrl) {
      return Response.json({ error: 'URL media mancante' }, { status: 400 });
    }

    // Prompt neutro e generico per evitare refusal
    const prompt = `Analizza questa immagine e genera contenuti per Instagram in ITALIANO.

L'immagine può mostrare:
- Allenamenti, esercizi, palestra, sport
- Cibo, pasti, ricette, nutrizione
- Trasformazioni fisiche, prima/dopo
- Lifestyle, motivazione, benessere

Crea 3 varianti di post Instagram (motivazionale, educativo, promozionale) con caption coinvolgenti, hashtag e call-to-action.

IMPORTANTE: Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, markdown o spiegazioni.

Struttura JSON:
{
  "description": "breve descrizione del contenuto (max 30 parole)",
  "variants": [
    {
      "type": "motivazionale",
      "caption": "caption coinvolgente con emoji (100-150 parole)",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    },
    {
      "type": "educativo",
      "caption": "caption educativa con emoji (100-150 parole)",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    },
    {
      "type": "promozionale",
      "caption": "caption promozionale con emoji (100-150 parole)",
      "cta": "call to action efficace",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
    }
  ]
}

Usa tono professionale ma amichevole.`;

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
      
      // Fallback: riprova con prompt minimale
      console.log('Tentativo fallback con prompt ridotto...');
      
      const fallbackMessages = [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `Descrivi questa immagine e crea 3 caption Instagram (motivazionale, educativo, promozionale) con hashtag. Rispondi solo con JSON valido:
{
  "description": "descrizione",
  "variants": [
    {"type": "motivazionale", "caption": "testo", "cta": "azione", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]},
    {"type": "educativo", "caption": "testo", "cta": "azione", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]},
    {"type": "promozionale", "caption": "testo", "cta": "azione", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]}
  ]
}` 
            },
            {
              type: 'image_url',
              image_url: { url: mediaUrl, detail: "low" }
            }
          ]
        }
      ];
      
      const fallbackResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: fallbackMessages,
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const fallbackContent = fallbackResponse.choices[0].message.content;
      const fallbackRefusal = fallbackResponse.choices[0].message.refusal;
      
      if (fallbackRefusal || !fallbackContent) {
        return Response.json({ 
          error: 'Contenuto non analizzabile',
          details: 'L\'immagine non può essere analizzata dai filtri di sicurezza. Prova con un\'altra immagine.'
        }, { status: 400 });
      }
      
      let cleanFallback = fallbackContent.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const fallbackResult = JSON.parse(cleanFallback);
      
      console.log('Fallback completato con successo');
      return Response.json({ success: true, data: fallbackResult });
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