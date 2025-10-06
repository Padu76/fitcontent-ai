import { generatePosts } from '../../../lib/openai.js'
import { supabase } from '../../../lib/supabase.js'
import { NextResponse } from 'next/server'

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { description, contentType, userId } = await request.json()

    if (!description || !contentType) {
      return NextResponse.json(
        { error: 'Descrizione e tipo contenuto richiesti' },
        { status: 400 }
      )
    }

    // Genera i post con OpenAI
    const posts = await generatePosts(description, contentType)

    // Ritorna direttamente i post (senza Supabase per ora)
    return NextResponse.json({ 
      posts: posts.map((post, i) => ({
        ...post,
        post_type: post.type,
        id: i
      }))
    })

  } catch (error) {
    console.error('Errore generazione:', error)
    return NextResponse.json(
      { error: 'Errore durante la generazione: ' + error.message },
      { status: 500 }
    )
  }
}