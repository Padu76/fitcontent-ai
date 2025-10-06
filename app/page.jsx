'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'

// Componente Preview Instagram Modal
function InstagramPreview({ isOpen, onClose, variant, preview, fileName }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header Instagram */}
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #dbdbdb',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}></div>
          <strong style={{fontSize: '0.9rem'}}>your_fitness_account</strong>
        </div>

        {/* Immagine/Video */}
        {preview && (
          preview.includes('video') || fileName?.includes('.mp4') ? (
            <video src={preview} controls style={{width: '100%', maxHeight: '500px', objectFit: 'cover'}} />
          ) : (
            <img src={preview} alt="Preview" style={{width: '100%', maxHeight: '500px', objectFit: 'cover'}} />
          )
        )}

        {/* Caption */}
        <div style={{padding: '15px'}}>
          <div style={{marginBottom: '10px'}}>
            <strong style={{fontSize: '0.9rem', marginRight: '8px'}}>your_fitness_account</strong>
            <span style={{fontSize: '0.9rem', color: '#262626', whiteSpace: 'pre-wrap', lineHeight: '1.5'}}>
              {variant?.caption}
            </span>
          </div>
          <div style={{fontSize: '0.85rem', color: '#00376b', marginBottom: '10px'}}>
            {variant?.hashtags?.join(' ')}
          </div>
          <div style={{fontSize: '0.85rem', color: '#8e8e8e', marginBottom: '15px'}}>
            2 ore fa
          </div>
        </div>

        {/* Bottone chiudi */}
        <div style={{padding: '15px', borderTop: '1px solid #dbdbdb'}}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Chiudi Preview
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente MediaUpload semplificato
function MediaUpload() {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [currentAnalyzing, setCurrentAnalyzing] = useState(null)
  const [loadingText, setLoadingText] = useState('Analisi in corso...')
  const [progress, setProgress] = useState(0)
  const [reels, setReels] = useState([])
  const [error, setError] = useState(null)
  const [previewModal, setPreviewModal] = useState({ isOpen: false, variant: null, preview: null, fileName: null })

  // Testi loading animati
  const loadingTexts = [
    'Analisi AI in corso...',
    'Elaborazione contenuto...',
    'Generazione caption...',
    'Creazione hashtag...',
    'Quasi pronto...'
  ]

  // Estrai frame da video
  const extractVideoFrame = (videoFile, timestamp = 1) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(timestamp, video.duration - 0.1)
      }
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const frameFile = new File([blob], 'video-frame.jpg', { type: 'image/jpeg' })
            resolve(frameFile)
          } else {
            reject(new Error('Impossibile estrarre frame'))
          }
        }, 'image/jpeg', 0.9)
      }
      
      video.onerror = () => reject(new Error('Errore nel caricamento video'))
      video.src = URL.createObjectURL(videoFile)
    })
  }

  // Processa singolo file
  const processFile = async (file) => {
    const isImage = file.type.startsWith('image')
    const isVideo = file.type.startsWith('video')

    if (!isImage && !isVideo) {
      throw new Error('Formato non supportato')
    }

    let frameToCompress

    if (isVideo) {
      const maxVideoSize = 100 * 1024 * 1024
      if (file.size > maxVideoSize) {
        throw new Error('Video troppo grande (max 100MB)')
      }

      frameToCompress = await extractVideoFrame(file, 1)
    } else {
      frameToCompress = file
    }

    // Comprimi
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: isVideo ? 'image/jpeg' : file.type
    }
    
    const compressedFrame = await imageCompression(frameToCompress, options)
    
    return {
      originalFile: file,
      frame: compressedFrame,
      preview: URL.createObjectURL(isVideo ? file : compressedFrame),
      isVideo,
      name: file.name,
      id: Date.now() + Math.random()
    }
  }

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10)
    if (selectedFiles.length > 0) {
      await addFiles(selectedFiles)
    }
  }

  const addFiles = async (selectedFiles) => {
    setError(null)
    setProcessing(true)

    const processedFiles = []

    try {
      for (const file of selectedFiles) {
        try {
          const processed = await processFile(file)
          processedFiles.push(processed)
        } catch (err) {
          console.error('Errore processing file:', err)
          setError(`Errore su ${file.name}: ${err.message}`)
        }
      }

      setFiles(prev => [...prev, ...processedFiles])
      setProcessing(false)

    } catch (err) {
      setError('Errore durante elaborazione: ' + err.message)
      setProcessing(false)
    }
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleGenerateReels = async () => {
    if (files.length === 0) return

    setError(null)
    setAnalyzing(true)
    setProgress(0)
    const generatedReels = []

    // Animazione testo loading
    let textIndex = 0
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length
      setLoadingText(loadingTexts[textIndex])
    }, 2000)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentAnalyzing(i)
      setProgress(Math.round((i / files.length) * 100))

      try {
        // Upload
        const formData = new FormData()
        formData.append('file', file.frame)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadRes.json()

        if (!uploadData.success) {
          throw new Error(uploadData.error)
        }

        // Analisi
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaUrl: uploadData.url,
            mediaType: 'image',
          }),
        })

        const analyzeData = await analyzeRes.json()

        if (!analyzeData.success) {
          throw new Error(analyzeData.error)
        }

        generatedReels.push({
          ...analyzeData.data,
          preview: file.preview,
          fileName: file.name,
          fileId: file.id
        })

      } catch (err) {
        console.error('Errore su file:', file.name, err)
        generatedReels.push({
          error: true,
          errorMessage: err.message,
          fileName: file.name,
          fileId: file.id
        })
      }
    }

    setProgress(100)
    clearInterval(textInterval)
    setReels(generatedReels)
    setAnalyzing(false)
    setCurrentAnalyzing(null)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copiato!')
  }

  const openPreview = (variant, preview, fileName) => {
    setPreviewModal({ isOpen: true, variant, preview, fileName })
  }

  const closePreview = () => {
    setPreviewModal({ isOpen: false, variant: null, preview: null, fileName: null })
  }

  const resetAll = () => {
    setFiles([])
    setReels([])
    setError(null)
    setAnalyzing(false)
    setCurrentAnalyzing(null)
    setProgress(0)
  }

  return (
    <div className="card">
      <h2 style={{fontSize: '1.8rem', marginBottom: '20px', color: '#333'}}>Carica Video o Foto</h2>

      {files.length === 0 && !analyzing && (
        <div>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            style={{display: 'none'}}
            id="fileInput"
            disabled={processing}
          />
          <label htmlFor="fileInput">
            <div style={{
              border: '4px dashed #ccc',
              borderRadius: '15px',
              padding: '50px',
              textAlign: 'center',
              cursor: processing ? 'wait' : 'pointer',
              transition: 'all 0.3s',
              background: '#f8f9ff'
            }}>
              {processing ? (
                <div>
                  <div className="spinner" style={{margin: '20px auto'}}></div>
                  <p style={{color: '#667eea', fontWeight: '600'}}>Elaborazione files...</p>
                </div>
              ) : (
                <div>
                  <p style={{fontSize: '1.5rem', marginBottom: '10px'}}>Trascina qui i files</p>
                  <p style={{color: '#999'}}>oppure clicca per selezionare</p>
                  <p style={{fontSize: '0.85rem', color: '#bbb', marginTop: '10px'}}>
                    Max 10 files - Immagini: JPG, PNG - Video: MP4
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      {files.length > 0 && !analyzing && reels.length === 0 && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            {files.map(file => (
              <div key={file.id} style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #e0e0e0',
                background: 'white'
              }}>
                {file.isVideo ? (
                  <video 
                    src={file.preview} 
                    style={{width: '100%', height: '150px', objectFit: 'cover'}}
                  />
                ) : (
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    style={{width: '100%', height: '150px', objectFit: 'cover'}}
                  />
                )}
                <div style={{
                  padding: '8px',
                  fontSize: '0.75rem',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.name}
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            
            <label htmlFor="fileInputAdd" style={{
              border: '2px dashed #667eea',
              borderRadius: '12px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: '#f8f9ff',
              fontSize: '2rem',
              color: '#667eea'
            }}>
              +
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              style={{display: 'none'}}
              id="fileInputAdd"
              disabled={processing}
            />
          </div>

          <button
            onClick={handleGenerateReels}
            className="btn"
            style={{width: '100%', marginBottom: '10px'}}
          >
            Genera {files.length} Reel
          </button>

          <button
            onClick={resetAll}
            style={{
              width: '100%',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reset
          </button>
        </div>
      )}

      {analyzing && (
        <div style={{textAlign: 'center', padding: '40px'}}>
          <div className="spinner" style={{margin: '20px auto'}}></div>
          <p style={{color: '#667eea', fontWeight: '600', fontSize: '1.2rem', marginBottom: '10px'}}>
            {loadingText}
          </p>
          <p style={{color: '#999', fontSize: '0.9rem', marginBottom: '20px'}}>
            File {currentAnalyzing + 1} di {files.length}
          </p>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            background: '#e0e0e0',
            borderRadius: '10px',
            height: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s ease',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {progress}%
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '10px',
          border: '2px solid #ef5350'
        }}>
          {error}
        </div>
      )}

      {reels.length > 0 && (
        <div style={{marginTop: '30px'}}>
          <h3 style={{fontSize: '1.5rem', marginBottom: '20px', color: '#333'}}>
            Reel Generati ({reels.length})
          </h3>

          <div style={{
            maxHeight: '600px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {reels.map((reel, idx) => (
              <div key={idx} style={{
                marginBottom: '30px',
                padding: '25px',
                background: 'white',
                borderRadius: '15px',
                border: reel.error ? '3px solid #f44336' : '3px solid #667eea',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <h4 style={{fontSize: '1.3rem', fontWeight: '700', color: '#333'}}>
                    Reel {idx + 1}
                  </h4>
                  <div style={{fontSize: '0.9rem', color: '#999'}}>
                    {reel.fileName}
                  </div>
                </div>

                {reel.error ? (
                  <div style={{
                    padding: '20px',
                    background: '#ffebee',
                    borderRadius: '10px',
                    color: '#c62828'
                  }}>
                    <strong>Errore:</strong> {reel.errorMessage}
                  </div>
                ) : (
                  <>
                    <div style={{
                      background: '#e3f2fd',
                      padding: '15px',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      border: '2px solid #2196f3'
                    }}>
                      <strong>Descrizione:</strong> {reel.description}
                    </div>

                    {reel.variants?.map((variant, varIdx) => (
                      <div key={varIdx} style={{
                        background: '#fafafa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '15px',
                        border: '2px solid #e0e0e0'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px'
                        }}>
                          <h5 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            textTransform: 'capitalize',
                            color: '#333'
                          }}>
                            {variant.type}
                          </h5>
                          <div style={{display: 'flex', gap: '10px'}}>
                            <button
                              onClick={() => openPreview(variant, reel.preview, reel.fileName)}
                              style={{
                                background: '#2196f3',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => copyToClipboard(`${variant.caption}\n\n${variant.hashtags.join(' ')}\n\n${variant.cta}`)}
                              style={{
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}
                            >
                              Copia
                            </button>
                          </div>
                        </div>
                        <p style={{
                          marginBottom: '15px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                          color: '#333'
                        }}>
                          {variant.caption}
                        </p>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#2196f3',
                          marginBottom: '10px'
                        }}>
                          {variant.hashtags.join(' ')}
                        </p>
                        <p style={{
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          color: '#9c27b0'
                        }}>
                          {variant.cta}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={resetAll}
            style={{
              width: '100%',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              marginTop: '20px'
            }}
          >
            Carica Altri Media
          </button>
        </div>
      )}

      <InstagramPreview 
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        variant={previewModal.variant}
        preview={previewModal.preview}
        fileName={previewModal.fileName}
      />
    </div>
  )
}

// Componente principale
export default function Home() {
  const [activeTab, setActiveTab] = useState('text')
  const [currentStep, setCurrentStep] = useState(0)
  const [showGenerator, setShowGenerator] = useState(false)
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('workout')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState(null)

  const steps = [
    {
      icon: '📝',
      title: 'Descrivi o Carica',
      description: 'Scrivi 2 righe sul tuo allenamento oppure carica foto/video',
      example: 'Es: "Sessione upper body con focus su panca piana. Record personale!"'
    },
    {
      icon: '🤖',
      title: 'L\'AI analizza',
      description: 'GPT-4o legge il contenuto e capisce esercizi, emozioni e contesto',
      example: 'Riconosce squat, panca, trazioni e genera caption mirate'
    },
    {
      icon: '✨',
      title: '3 varianti pronte',
      description: 'Motivazionale, educativa e promozionale. Scegli e copia.',
      example: 'Caption + hashtag + CTA in 10 secondi'
    }
  ]

  const benefits = [
    {
      icon: '⏱️',
      title: 'Da 45 min a 2 min',
      value: 'Risparmio: -95% tempo'
    },
    {
      icon: '📈',
      title: '+300% contenuti',
      value: '12-15 post/mese costanti'
    },
    {
      icon: '💰',
      title: 'ROI immediato',
      value: '1 cliente = 500-1000€'
    }
  ]

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
          userId: 'temp-user-id'
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
    alert('Caption copiata!')
  }

  if (showGenerator) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', color: 'white', marginBottom: '40px'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px'}}>
            FitContent AI
          </h1>
          <p style={{fontSize: '1.1rem', opacity: 0.9}}>
            Trasforma le tue sessioni in contenuti pronti da postare
          </p>
          <button 
            onClick={() => setShowGenerator(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '8px',
              marginTop: '15px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Torna alla guida
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '15px 40px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'text' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.9)',
              color: activeTab === 'text' ? 'white' : '#667eea',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'text' 
                ? '0 5px 15px rgba(102, 126, 234, 0.4)' 
                : 'none'
            }}
          >
            Genera da Testo
          </button>
          <button
            onClick={() => setActiveTab('media')}
            style={{
              padding: '15px 40px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'media' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.9)',
              color: activeTab === 'media' ? 'white' : '#667eea',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'media' 
                ? '0 5px 15px rgba(102, 126, 234, 0.4)' 
                : 'none'
            }}
          >
            Carica Media
          </button>
        </div>

        {activeTab === 'text' && (
          <div className="card">
            <div className="form-group">
              <label>Descrivi l'allenamento</label>
              <textarea
                placeholder="Es: Sessione gambe intensa con focus su squat. Cliente ha migliorato il carico del 10%"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tipo contenuto</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option value="workout">Allenamento</option>
                <option value="transformation">Trasformazione</option>
                <option value="tip">Consiglio tecnico</option>
                <option value="lifestyle">Behind the scenes</option>
              </select>
            </div>

            <button className="btn" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generazione...' : 'Genera 3 post'}
            </button>

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p style={{color: '#667eea', fontWeight: '600'}}>L'AI sta creando i tuoi contenuti...</p>
              </div>
            )}

            {posts && (
              <div style={{marginTop: '40px'}}>
                <h3 style={{marginBottom: '20px', color: '#333'}}>I tuoi post pronti</h3>
                {posts.map((post, i) => (
                  <div key={i} className={`post-card ${post.post_type}`}>
                    <span className={`post-type ${post.post_type}`}>
                      {post.post_type === 'motivational' && 'Motivazionale'}
                      {post.post_type === 'educational' && 'Educativo'}
                      {post.post_type === 'promotional' && 'Promozionale'}
                    </span>
                    <div className="caption">{post.caption}</div>
                    <div className="hashtags" style={{marginTop: '15px'}}>{post.hashtags}</div>
                    <div style={{marginTop: '10px', fontSize: '0.9rem', color: '#666'}}>
                      <strong>CTA:</strong> {post.cta}
                    </div>
                    <button 
                      className="btn" 
                      style={{marginTop: '15px', padding: '10px 20px', fontSize: '0.9rem', width: 'auto'}}
                      onClick={() => copyToClipboard(`${post.caption}\n\n${post.hashtags}`)}
                    >
                      Copia caption
                    </button>
                  </div>
                ))}
                
                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  background: '#e8f5e9',
                  borderRadius: '12px',
                  border: '2px solid #4caf50'
                }}>
                  <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#2e7d32', marginBottom: '10px'}}>
                    Hai appena risparmiato 30 minuti!
                  </div>
                  <div style={{color: '#555', lineHeight: '1.6'}}>
                    Tempo per scrivere 3 post manualmente: ~45 minuti<br/>
                    Tempo con FitContent AI: 2 minuti<br/>
                    <strong style={{color: '#2e7d32'}}>Risparmio: 43 minuti</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && <MediaUpload />}
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{textAlign: 'center', color: 'white', marginBottom: '50px'}}>
        <h1 style={{fontSize: '3rem', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2'}}>
          FitContent AI
        </h1>
        <p style={{fontSize: '1.3rem', opacity: 0.95, marginBottom: '10px'}}>
          Da allenamento a 3 post Instagram in 10 secondi
        </p>
        <p style={{fontSize: '1rem', opacity: 0.8}}>
          Carica video/foto o scrivi 2 righe. L'AI fa il resto.
        </p>
      </div>

      <div className="card" style={{marginBottom: '30px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '35px', color: '#333', fontSize: '1.8rem'}}>
          Perché usarlo
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {benefits.map((benefit, i) => (
            <div key={i} style={{
              background: '#f8f9ff',
              padding: '25px',
              borderRadius: '15px',
              border: '2px solid #e8eaff',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>{benefit.icon}</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '10px', color: '#333'}}>{benefit.title}</h3>
              <div style={{
                background: '#fff3cd',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#856404',
                fontWeight: '600'
              }}>
                {benefit.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px'}}>
            Calcolo veloce
          </div>
          <div style={{fontSize: '1rem', opacity: 0.95}}>
            Tempo risparmiato: <strong>~20 ore/mese</strong> • Valore: <strong>1.000€</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{textAlign: 'center', marginBottom: '15px', color: '#333', fontSize: '1.8rem'}}>
          Come funziona
        </h2>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1rem'}}>
          3 step semplicissimi
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '40px',
          position: 'relative'
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: i <= currentStep ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: i === currentStep ? '4px solid #ffd700' : 'none'
              }} onClick={() => setCurrentStep(i)}>
                {step.icon}
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: i <= currentStep ? '#667eea' : '#999'
              }}>
                Step {i + 1}
              </div>
            </div>
          ))}
          
          <div style={{
            position: 'absolute',
            top: '30px',
            left: '10%',
            right: '10%',
            height: '4px',
            background: '#e0e0e0',
            zIndex: 0
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              transition: 'width 0.3s'
            }}/>
          </div>
        </div>

        <div style={{
          background: '#f8f9ff',
          padding: '35px',
          borderRadius: '15px',
          minHeight: '200px',
          border: '2px solid #e8eaff'
        }}>
          <div style={{fontSize: '3rem', marginBottom: '15px', textAlign: 'center'}}>
            {steps[currentStep].icon}
          </div>
          
          <h3 style={{
            fontSize: '1.5rem',
            marginBottom: '15px',
            color: '#333',
            textAlign: 'center'
          }}>
            {steps[currentStep].title}
          </h3>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#555',
            lineHeight: '1.7',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {steps[currentStep].description}
          </p>

          <div style={{
            background: '#fff3cd',
            padding: '15px',
            borderRadius: '10px',
            fontSize: '0.95rem',
            color: '#856404',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {steps[currentStep].example}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '25px',
          gap: '15px'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '12px 25px',
              borderRadius: '10px',
              border: '2px solid #667eea',
              background: 'white',
              color: '#667eea',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
              flex: 1
            }}
          >
            Indietro
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              style={{
                padding: '12px 25px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Avanti
            </button>
          ) : (
            <button
              onClick={() => setShowGenerator(true)}
              style={{
                padding: '15px 40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                flex: 1,
                boxShadow: '0 5px 15px rgba(67, 233, 123, 0.4)'
              }}
            >
              Inizia ora!
            </button>
          )}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{color: 'white', fontSize: '2rem', marginBottom: '15px'}}>
          Pronto a risparmiare ore ogni settimana?
        </h2>
        <p style={{color: 'white', opacity: 0.9, fontSize: '1.1rem', marginBottom: '25px'}}>
          Genera il tuo primo post in meno di 2 minuti
        </p>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn"
          style={{
            fontSize: '1.2rem',
            padding: '18px 50px',
            background: 'white',
            color: '#667eea',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          Inizia gratis ora
        </button>
      </div>
    </div>
  )
}