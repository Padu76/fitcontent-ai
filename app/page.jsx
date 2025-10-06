'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'

// Componente MediaUpload integrato
function MediaUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [extractingFrame, setExtractingFrame] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const extractVideoFrame = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      
      video.onloadeddata = () => {
        video.currentTime = 1
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

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      await processFile(droppedFile)
    }
  }

  const processFile = async (selectedFile) => {
    setError(null)
    setResults(null)

    const isImage = selectedFile.type.startsWith('image')
    const isVideo = selectedFile.type.startsWith('video')

    if (!isImage && !isVideo) {
      setError('Formato non supportato. Usa JPG, PNG o MP4')
      return
    }

    if (isVideo) {
      const maxVideoSize = 100 * 1024 * 1024
      if (selectedFile.size > maxVideoSize) {
        setError('Video troppo grande (max 100MB)')
        return
      }

      setVideoFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)

      try {
        setExtractingFrame(true)
        const frameFile = await extractVideoFrame(selectedFile)
        
        setCompressing(true)
        setExtractingFrame(false)
        
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg'
        }
        
        const compressedFrame = await imageCompression(frameFile, options)
        setFile(compressedFrame)
        setCompressing(false)
        
      } catch (err) {
        setError('Errore elaborazione video: ' + err.message)
        setExtractingFrame(false)
        setCompressing(false)
      }
      return
    }

    if (isImage) {
      setCompressing(true)
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: selectedFile.type
        }
        
        const compressedFile = await imageCompression(selectedFile, options)
        setFile(compressedFile)
        
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(compressedFile)
        
        setCompressing(false)
      } catch (err) {
        setError('Errore compressione: ' + err.message)
        setCompressing(false)
      }
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadData.success) {
        throw new Error(uploadData.error)
      }

      setUploading(false)
      setAnalyzing(true)

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

      setResults(analyzeData.data)
      setAnalyzing(false)

    } catch (err) {
      setError(err.message)
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copiato!')
  }

  return (
    <div className="card">
      <h2 style={{fontSize: '1.8rem', marginBottom: '20px', color: '#333'}}>Carica Video o Foto</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '4px dashed #ccc',
          borderRadius: '15px',
          padding: '50px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
          background: '#f8f9ff'
        }}
      >
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{display: 'none'}}
          id="fileInput"
          disabled={compressing || extractingFrame}
        />
        <label htmlFor="fileInput" style={{cursor: compressing || extractingFrame ? 'wait' : 'pointer'}}>
          {extractingFrame ? (
            <div>
              <div className="spinner" style={{margin: '20px auto'}}></div>
              <p style={{color: '#667eea', fontWeight: '600'}}>Estrazione frame dal video...</p>
            </div>
          ) : compressing ? (
            <div>
              <div className="spinner" style={{margin: '20px auto'}}></div>
              <p style={{color: '#667eea', fontWeight: '600'}}>Compressione...</p>
            </div>
          ) : preview ? (
            <div>
              {videoFile ? (
                <video src={preview} controls style={{maxHeight: '250px', margin: '0 auto', borderRadius: '10px'}} />
              ) : (
                <img src={preview} alt="Preview" style={{maxHeight: '250px', margin: '0 auto', borderRadius: '10px'}} />
              )}
              <p style={{marginTop: '15px', fontSize: '0.9rem', color: '#666'}}>
                {videoFile ? videoFile.name : file?.name}
                {file && ` (Frame estratto: ${(file.size / 1024 / 1024).toFixed(2)} MB)`}
              </p>
            </div>
          ) : (
            <div>
              <p style={{fontSize: '1.5rem', marginBottom: '10px'}}>Trascina qui il file</p>
              <p style={{color: '#999'}}>oppure clicca per selezionare</p>
              <p style={{fontSize: '0.85rem', color: '#bbb', marginTop: '10px'}}>
                Immagini: JPG, PNG<br/>
                Video: MP4 (estrazione automatica frame)
              </p>
            </div>
          )}
        </label>
      </div>

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

      {file && !results && !compressing && !extractingFrame && (
        <button
          onClick={handleUploadAndAnalyze}
          disabled={uploading || analyzing}
          className="btn"
          style={{
            marginTop: '25px',
            width: '100%',
            opacity: (uploading || analyzing) ? 0.6 : 1
          }}
        >
          {uploading ? 'Caricamento...' : analyzing ? 'Analisi AI in corso...' : 'Analizza e Genera Post'}
        </button>
      )}

      {results && (
        <div style={{marginTop: '30px'}}>
          <div style={{
            background: '#e3f2fd',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #2196f3'
          }}>
            <strong>Descrizione:</strong> {results.description}
          </div>

          {results.variants?.map((variant, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '2px solid #e0e0e0',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  color: '#333'
                }}>
                  {variant.type}
                </h3>
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

          <button
            onClick={() => {
              setFile(null)
              setVideoFile(null)
              setPreview(null)
              setResults(null)
              setError(null)
            }}
            style={{
              width: '100%',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Carica Altro Media
          </button>
        </div>
      )}
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