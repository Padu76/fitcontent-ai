'use client'

import { useState, useEffect } from 'react'
import imageCompression from 'browser-image-compression'

// Componente gestione template
function TemplateManager({ onSelectTemplate, selectedTemplate }) {
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    tone: 'neutral',
    captionLength: 'medium',
    hashtagStyle: 'mixed'
  })

  useEffect(() => {
    const saved = localStorage.getItem('fitcontent_templates')
    if (saved) {
      setTemplates(JSON.parse(saved))
    }
  }, [])

  const saveTemplate = () => {
    if (!formData.name.trim()) {
      alert('Inserisci un nome per il template')
      return
    }

    const newTemplate = { ...formData, id: Date.now() }
    const updated = [...templates, newTemplate]
    setTemplates(updated)
    localStorage.setItem('fitcontent_templates', JSON.stringify(updated))
    setFormData({ name: '', tone: 'neutral', captionLength: 'medium', hashtagStyle: 'mixed' })
    setShowForm(false)
  }

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    localStorage.setItem('fitcontent_templates', JSON.stringify(updated))
    if (selectedTemplate?.id === id) {
      onSelectTemplate(null)
    }
  }

  return (
    <div style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <label style={{ fontWeight: '600', color: '#333' }}>Template Stile</label>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Annulla' : '+ Nuovo Template'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#f8f9ff',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '15px',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#333' }}>Nome Template</label>
            <input
              type="text"
              placeholder="Es: Post Motivazionali Aggressivi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#333' }}>Tono</label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            >
              <option value="neutral">Neutro - Professionale e bilanciato</option>
              <option value="aggressive">Aggressivo - Diretto e imperativo</option>
              <option value="soft">Morbido - Empatico e incoraggiante</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#333' }}>Lunghezza Caption</label>
            <select
              value={formData.captionLength}
              onChange={(e) => setFormData({ ...formData, captionLength: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            >
              <option value="short">Corta (50-80 parole)</option>
              <option value="medium">Media (100-150 parole)</option>
              <option value="long">Lunga (150-200 parole)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#333' }}>Stile Hashtag</label>
            <select
              value={formData.hashtagStyle}
              onChange={(e) => setFormData({ ...formData, hashtagStyle: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            >
              <option value="mixed">Mix - Popolari + Nicchia</option>
              <option value="popular">Popolari - Massima reach</option>
              <option value="niche">Nicchia - Specifici e tecnici</option>
            </select>
          </div>

          <button
            onClick={saveTemplate}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Salva Template
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onSelectTemplate(null)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            background: !selectedTemplate ? '#667eea' : 'white',
            color: !selectedTemplate ? 'white' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          Nessun Template
        </button>
        {templates.map(template => (
          <div key={template.id} style={{ position: 'relative' }}>
            <button
              onClick={() => onSelectTemplate(template)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                background: selectedTemplate?.id === template.id ? '#667eea' : 'white',
                color: selectedTemplate?.id === template.id ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                paddingRight: '35px'
              }}
            >
              {template.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Eliminare il template "${template.name}"?`)) {
                  deleteTemplate(template.id)
                }
              }}
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: selectedTemplate?.id === template.id ? 'white' : '#999',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '0.85rem',
          border: '2px solid #2196f3'
        }}>
          <strong>Template selezionato:</strong> {selectedTemplate.name}<br />
          Tono: {selectedTemplate.tone === 'aggressive' ? 'Aggressivo' : selectedTemplate.tone === 'soft' ? 'Morbido' : 'Neutro'} | 
          Lunghezza: {selectedTemplate.captionLength === 'short' ? 'Corta' : selectedTemplate.captionLength === 'medium' ? 'Media' : 'Lunga'} | 
          Hashtag: {selectedTemplate.hashtagStyle === 'popular' ? 'Popolari' : selectedTemplate.hashtagStyle === 'niche' ? 'Nicchia' : 'Mix'}
        </div>
      )}
    </div>
  )
}

// Componente MediaUpload con multi-upload e split video
function MediaUpload() {
  const [files, setFiles] = useState([])
  const [seriesTitle, setSeriesTitle] = useState('')
  const [chunkDuration, setChunkDuration] = useState(90)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState([])
  const [reels, setReels] = useState([])
  const [error, setError] = useState(null)

  // Estrai frame da video a un determinato timestamp
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

  // Ottieni durata video
  const getVideoDuration = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      
      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
      
      video.onerror = () => reject(new Error('Impossibile leggere durata video'))
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

    if (isVideo) {
      const maxVideoSize = 100 * 1024 * 1024
      if (file.size > maxVideoSize) {
        throw new Error('Video troppo grande (max 100MB)')
      }

      const duration = await getVideoDuration(file)
      const chunks = []

      // Se video è più lungo del chunk, dividi
      if (duration > chunkDuration) {
        const numChunks = Math.ceil(duration / chunkDuration)
        for (let i = 0; i < numChunks; i++) {
          const timestamp = i * chunkDuration + 1
          chunks.push({
            chunkIndex: i,
            totalChunks: numChunks,
            timestamp,
            duration: Math.min(chunkDuration, duration - i * chunkDuration)
          })
        }
      } else {
        chunks.push({
          chunkIndex: 0,
          totalChunks: 1,
          timestamp: 1,
          duration
        })
      }

      // Estrai frame da ogni chunk
      const processedChunks = []
      for (const chunk of chunks) {
        const frameFile = await extractVideoFrame(file, chunk.timestamp)
        
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg'
        }
        
        const compressedFrame = await imageCompression(frameFile, options)
        
        processedChunks.push({
          ...chunk,
          frame: compressedFrame,
          originalFile: file,
          preview: URL.createObjectURL(file)
        })
      }

      return processedChunks
    }

    // Immagine
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type
    }
    
    const compressedFile = await imageCompression(file, options)
    
    return [{
      chunkIndex: 0,
      totalChunks: 1,
      frame: compressedFile,
      originalFile: file,
      preview: URL.createObjectURL(compressedFile),
      timestamp: 0,
      duration: 0
    }]
  }

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10)
    if (selectedFiles.length > 0) {
      await processFiles(selectedFiles)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 10)
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles)
    }
  }

  const processFiles = async (selectedFiles) => {
    setError(null)
    setReels([])
    setProcessing(true)
    setUploadProgress([])

    const allChunks = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(prev => [...prev, { index: i, status: 'processing', name: selectedFiles[i].name }])
        
        try {
          const chunks = await processFile(selectedFiles[i])
          allChunks.push(...chunks.map(chunk => ({
            ...chunk,
            fileIndex: i,
            fileName: selectedFiles[i].name
          })))
          
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'ready' } : p
          ))
        } catch (err) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: err.message } : p
          ))
        }
      }

      setFiles(allChunks)
      setProcessing(false)

    } catch (err) {
      setError('Errore durante elaborazione: ' + err.message)
      setProcessing(false)
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (files.length === 0) return

    setError(null)
    const generatedReels = []

    for (let i = 0; i < files.length; i++) {
      const fileChunk = files[i]
      
      setUploadProgress(prev => prev.map((p, idx) => 
        idx === fileChunk.fileIndex ? { ...p, status: 'uploading' } : p
      ))

      try {
        // Upload frame
        const formData = new FormData()
        formData.append('file', fileChunk.frame)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadRes.json()

        if (!uploadData.success) {
          throw new Error(uploadData.error)
        }

        setUploadProgress(prev => prev.map((p, idx) => 
          idx === fileChunk.fileIndex ? { ...p, status: 'analyzing' } : p
        ))

        // Analisi con info reel e template
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaUrl: uploadData.url,
            mediaType: 'image',
            reelNumber: i + 1,
            totalReels: files.length,
            seriesTitle: seriesTitle || null,
            template: selectedTemplate || null,
          }),
        })

        const analyzeData = await analyzeRes.json()

        if (!analyzeData.success) {
          throw new Error(analyzeData.error)
        }

        // Aggiungi info reel
        const reelNumber = i + 1
        const totalReels = files.length
        const reelTitle = seriesTitle 
          ? `${seriesTitle} - Reel ${reelNumber} di ${totalReels}`
          : `Reel ${reelNumber} di ${totalReels}`

        generatedReels.push({
          ...analyzeData.data,
          reelNumber,
          totalReels,
          reelTitle,
          preview: fileChunk.preview,
          fileName: fileChunk.fileName,
          chunkInfo: fileChunk.totalChunks > 1 ? `Parte ${fileChunk.chunkIndex + 1}/${fileChunk.totalChunks}` : null
        })

        setUploadProgress(prev => prev.map((p, idx) => 
          idx === fileChunk.fileIndex ? { ...p, status: 'done' } : p
        ))

      } catch (err) {
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === fileChunk.fileIndex ? { ...p, status: 'error', error: err.message } : p
        ))
      }
    }

    setReels(generatedReels)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copiato!')
  }

  const resetUpload = () => {
    setFiles([])
    setReels([])
    setUploadProgress([])
    setError(null)
    setSeriesTitle('')
  }

  return (
    <div className="card">
      <h2 style={{fontSize: '1.8rem', marginBottom: '20px', color: '#333'}}>Carica Video o Foto</h2>

      {files.length === 0 && (
        <>
          <TemplateManager 
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />

          <div className="form-group" style={{marginBottom: '20px'}}>
            <label>Titolo Serie (opzionale)</label>
            <input
              type="text"
              placeholder='Es: "Trasformazione Marco" o "Allenamento Upper Body"'
              value={seriesTitle}
              onChange={(e) => setSeriesTitle(e.target.value)}
            />
          </div>

          <div className="form-group" style={{marginBottom: '25px'}}>
            <label>Durata massima per reel: {chunkDuration} secondi</label>
            <input
              type="range"
              min="30"
              max="90"
              step="10"
              value={chunkDuration}
              onChange={(e) => setChunkDuration(parseInt(e.target.value))}
              style={{width: '100%'}}
            />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#999', marginTop: '5px'}}>
              <span>30s</span>
              <span>60s</span>
              <span>90s</span>
            </div>
          </div>

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
              multiple
              onChange={handleFileChange}
              style={{display: 'none'}}
              id="fileInput"
              disabled={processing}
            />
            <label htmlFor="fileInput" style={{cursor: processing ? 'wait' : 'pointer'}}>
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
                    Max 10 files - Immagini: JPG, PNG<br/>
                    Video: MP4 (split automatico se &gt; {chunkDuration}s)
                  </p>
                </div>
              )}
            </label>
          </div>
        </>
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

      {uploadProgress.length > 0 && (
        <div style={{marginTop: '25px'}}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '15px', color: '#333'}}>
            Progress Upload
          </h3>
          {uploadProgress.map((progress, i) => (
            <div key={i} style={{
              padding: '12px',
              background: '#f8f9ff',
              borderRadius: '10px',
              marginBottom: '10px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.9rem', color: '#333', fontWeight: '500'}}>
                  {progress.name}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  background: 
                    progress.status === 'done' ? '#4caf50' :
                    progress.status === 'error' ? '#f44336' :
                    progress.status === 'analyzing' ? '#2196f3' :
                    progress.status === 'uploading' ? '#ff9800' :
                    progress.status === 'processing' ? '#9c27b0' :
                    '#ccc',
                  color: 'white'
                }}>
                  {progress.status === 'done' ? 'Completato' :
                   progress.status === 'error' ? 'Errore' :
                   progress.status === 'analyzing' ? 'Analisi AI' :
                   progress.status === 'uploading' ? 'Upload' :
                   progress.status === 'processing' ? 'Elaborazione' :
                   'In attesa'}
                </span>
              </div>
              {progress.error && (
                <div style={{fontSize: '0.8rem', color: '#c62828', marginTop: '5px'}}>
                  {progress.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && reels.length === 0 && !processing && (
        <div style={{marginTop: '25px'}}>
          <div style={{
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #2196f3'
          }}>
            <strong>Files pronti:</strong> {files.length} {files.length > 1 ? 'reel' : 'media'}
            {seriesTitle && <div style={{marginTop: '5px'}}>Serie: <strong>{seriesTitle}</strong></div>}
            {selectedTemplate && <div style={{marginTop: '5px'}}>Template: <strong>{selectedTemplate.name}</strong></div>}
          </div>

          <button
            onClick={handleUploadAndAnalyze}
            className="btn"
            style={{width: '100%', marginBottom: '10px'}}
          >
            Analizza e Genera Reel
          </button>

          <button
            onClick={resetUpload}
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
            Reset
          </button>
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
            {reels.map((reel, reelIdx) => (
              <div key={reelIdx} style={{
                marginBottom: '30px',
                padding: '25px',
                background: 'white',
                borderRadius: '15px',
                border: '3px solid #667eea',
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
                  <div>
                    <h4 style={{fontSize: '1.3rem', fontWeight: '700', color: '#333', marginBottom: '5px'}}>
                      {reel.reelTitle}
                    </h4>
                    {reel.chunkInfo && (
                      <span style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        background: '#f0f0f0',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        {reel.chunkInfo}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#999',
                    textAlign: 'right'
                  }}>
                    {reel.fileName}
                  </div>
                </div>

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
                      <button
                        onClick={() => copyToClipboard(`${reel.reelTitle}\n\n${variant.caption}\n\n${variant.hashtags.join(' ')}\n\n${variant.cta}`)}
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
              </div>
            ))}
          </div>

          <button
            onClick={resetUpload}
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