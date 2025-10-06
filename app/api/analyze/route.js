import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { mediaUrl, mediaType } = await request.json();

    if (!mediaUrl) {
      return Response.json({ error: 'URL media mancante' }, { status: 400 });
    }

    // Prompt per analizzare il contenuto fitness
    const prompt = `Analizza questo contenuto fitness e genera:
1. Descrizione breve dell'esercizio/attività mostrata
2. 3 varianti di caption Instagram (motivazionale, educativa, promozionale)
3. 15 hashtag mirati per fitness/personal training
4. 3 CTA efficaci

Rispondi in formato JSON con questa struttura:
{
  "description": "descrizione esercizio",
  "variants": [
    {
      "type": "motivazionale",
      "caption": "testo caption",
      "cta": "call to action",
      "hashtags": ["hashtag1", "hashtag2", ...]
    },
    ...altre 2 varianti
  ]
}`;

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: mediaType === 'video' ? 'image_url' : 'image_url',
            image_url: { url: mediaUrl }
          }
        ]
      }
    ];

    // Chiamata GPT-4o con Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // IMPORTANTE: serve gpt-4o per vision
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    return Response.json({ success: true, data: result });

  } catch (error) {
    console.error('Errore analisi:', error);
    return Response.json({ 
      error: 'Errore durante analisi', 
      details: error.message 
    }, { status: 500 });
  }
}