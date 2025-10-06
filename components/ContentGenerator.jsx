'use client'

import { useState } from 'react'

export default function ContentGenerator() {
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('workout')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState(null)

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Inserisci una descrizione!')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          contentType,
          userId: 'temp-user-id' // In produzione usa Supabase Auth
        })
      })

      const data = await res.json()
      setPosts(data.posts)
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore durante la generazione')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Caption copiata! ✅')
  }

  return (
    <div>
      <div className="form-group">
        <label>📝 Descrivi l'allenamento</label>
        <textarea
          placeholder="Es: Sessione gambe intensa con focus su squat. Cliente ha migliorato il carico del 10%"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>🎯 Tipo contenuto</label>
        <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
          <option value="workout">Allenamento</option>
          <option value="transformation">Trasformazione</option>
          <option value="tip">Consiglio tecnico</option>
          <option value="lifestyle">Behind the scenes</option>
        </select>
      </div>

      <button className="btn" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generazione...' : '✨ Genera 3 post'}
      </button>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>L'AI sta creando i tuoi contenuti...</p>
        </div>
      )}

      {posts && (
        <div style={{marginTop: '40px'}}>
          <h3 style={{marginBottom: '20px'}}>📱 I tuoi post</h3>
          {posts.map((post, i) => (
            <div key={i} className={`post-card ${post.post_type}`}>
              <span className={`post-type ${post.post_type}`}>
                {post.post_type === 'motivational' && '🔥 Motivazionale'}
                {post.post_type === 'educational' && '📚 Educativo'}
                {post.post_type === 'promotional' && '🎯 Promozionale'}
              </span>
              <div className="caption">{post.caption}</div>
              <div className="hashtags">{post.hashtags}</div>
              <div style={{marginTop: '15px'}}>
                <strong>CTA:</strong> {post.cta}
              </div>
              <button 
                className="btn" 
                style={{marginTop: '15px', padding: '10px 20px', fontSize: '0.9rem'}}
                onClick={() => copyToClipboard(`${post.caption}\n\n${post.hashtags}`)}
              >
                📋 Copia
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}