
import { generatePosts } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

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

    // Salva in Supabase
    const postsToInsert = posts.map(post => ({
      user_id: userId,
      description,
      content_type: contentType,
      post_type: post.type,
      caption: post.caption,
      hashtags: post.hashtags,
      cta: post.cta,
      saved: false
    }))

    const { data, error } = await supabase
      .from('posts')
      .insert(postsToInsert)
      .select()

    if (error) throw error

    return NextResponse.json({ posts: data })
  } catch (error) {
    console.error('Errore generazione:', error)
    return NextResponse.json(
      { error: 'Errore durante la generazione' },
      { status: 500 }
    )
  }
}