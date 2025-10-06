import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePosts(description, contentType) {
  const prompt = `Sei un esperto copywriter per personal trainer e coach fitness.

CONTESTO: ${description}
TIPO CONTENUTO: ${contentType}

Genera 3 varianti di post Instagram (motivazionale, educativo, promozionale) in ITALIANO.

Per ogni post includi:
- Caption coinvolgente (max 200 parole)
- Hashtag pertinenti (8-10)
- CTA efficace

FORMATO JSON:
{
  "posts": [
    {
      "type": "motivational",
      "caption": "...",
      "hashtags": "...",
      "cta": "..."
    },
    {
      "type": "educational",
      "caption": "...",
      "hashtags": "...",
      "cta": "..."
    },
    {
      "type": "promotional",
      "caption": "...",
      "hashtags": "...",
      "cta": "..."
    }
  ]
}

USA emoji dove appropriato. Scrivi in tono professionale ma amichevole.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sei un esperto di marketing per il settore fitness. Crei contenuti coinvolgenti, autentici e orientati ai risultati."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    response_format: { type: "json_object" }
  })

  const result = JSON.parse(completion.choices[0].message.content)
  return result.posts
}