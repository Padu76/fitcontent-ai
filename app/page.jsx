'use client'

import { useState } from 'react'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showGenerator, setShowGenerator] = useState(false)
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('workout')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState(null)

  const steps = [
    {
      icon: '📝',
      title: 'Descrivi il tuo allenamento',
      description: 'Scrivi in 2 righe cosa hai fatto con il cliente. Non serve essere precisi, l\'AI capisce tutto.',
      example: 'Es: "Sessione upper body con focus su panca piana. Il cliente ha superato il suo record personale"'
    },
    {
      icon: '🎯',
      title: 'Scegli il tipo di contenuto',
      description: 'Workout, trasformazione, consiglio tecnico o dietro le quinte. L\'AI adatta il tono.',
      example: 'Ogni tipo genera caption diverse: motivazionale, educativa e promozionale'
    },
    {
      icon: '✨',
      title: 'L\'AI genera 3 varianti',
      description: 'In 10 secondi ottieni 3 post completi pronti da copiare e incollare su Instagram.',
      example: 'Caption + hashtag + CTA. Tu scegli quale ti piace di più!'
    },
    {
      icon: '🚀',
      title: 'Copia e posta',
      description: 'Un click per copiare tutto. Apri Instagram, incolla, aggiungi la foto e pubblica.',
      example: 'Tempo totale: 2 minuti invece di 30 minuti a pensare cosa scrivere'
    }
  ]

  const benefits = [
    {
      icon: '⏱️',
      title: 'Risparmia 10 ore/settimana',
      before: 'Prima: 30-45 min per ogni post',
      after: 'Ora: 2 minuti per 3 varianti',
      value: 'Guadagni tempo per allenarti o trovare nuovi clienti'
    },
    {
      icon: '📈',
      title: '+300% contenuti pubblicati',
      before: 'Prima: 1-2 post a settimana (quando ti ricordi)',
      after: 'Ora: 12-15 post/mese costanti',
      value: 'Più visibilità = più richieste = più fatturato'
    },
    {
      icon: '💰',
      title: 'ROI immediato',
      before: 'Costo: 0,02€ per generazione',
      after: 'Valore: 1 cliente nuovo = 500-1000€',
      value: 'Basta 1 cliente in più al mese per ripagarti x100'
    },
    {
      icon: '🎯',
      title: 'Zero stress creativo',
      before: 'Prima: "Che ca**o scrivo oggi?"',
      after: 'Ora: L\'AI fa il lavoro pesante',
      value: 'Tu ti concentri su allenarti e allenare'
    }
  ]

  const comparison = [
    {
      task: 'Creare 1 post Instagram',
      manual: {
        time: '30-45 minuti',
        steps: ['Pensare al concetto', 'Scrivere la caption', 'Riscrivere 3-4 volte', 'Cercare hashtag', 'Dubitare di tutto', 'Pubblicare (forse)'],
        frustration: '😤😤😤',
        cost: 'Stress + procrastinazione'
      },
      withAI: {
        time: '2 minuti',
        steps: ['Descrivi in 2 righe', 'Clicca "Genera"', 'Scegli la variante', 'Copia e posta'],
        frustration: '😊',
        cost: '0,02€'
      }
    },
    {
      task: 'Piano editoriale settimanale (3 post)',
      manual: {
        time: '2-3 ore',
        steps: ['Brainstorming idee', 'Scrivere bozze', 'Revisionare', 'Cercare ispirazione online', 'Rimandare a domani'],
        frustration: '😫😫😫😫',
        cost: 'Domenica sera persa'
      },
      withAI: {
        time: '6 minuti',
        steps: ['3 sessioni descritte', '9 post generati', 'Scegli i migliori', 'Fatto'],
        frustration: '🎉',
        cost: '0,06€'
      }
    },
    {
      task: 'Contenuti per 1 mese (12 post)',
      manual: {
        time: '8-12 ore',
        steps: ['Pianificare temi', 'Scrivere contenuti', 'Blocco dello scrittore', 'Copiare dai competitor', 'Senso di colpa'],
        frustration: '💀💀💀💀💀',
        cost: '10 ore del tuo tempo = 500€'
      },
      withAI: {
        time: '24 minuti',
        steps: ['Descrivi 12 sessioni', '36 post generati', 'Mix & match', 'Calendario pronto'],
        frustration: '🚀',
        cost: '0,24€'
      }
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
    alert('Caption copiata! ✅')
  }

  if (showGenerator) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', color: 'white', marginBottom: '40px'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px'}}>
            💪 FitContent AI
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
            ← Torna alla guida
          </button>
        </div>

        <div className="card">
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
              <p style={{color: '#667eea', fontWeight: '600'}}>L'AI sta creando i tuoi contenuti...</p>
            </div>
          )}

          {posts && (
            <div style={{marginTop: '40px'}}>
              <h3 style={{marginBottom: '20px', color: '#333'}}>📱 I tuoi post pronti</h3>
              {posts.map((post, i) => (
                <div key={i} className={`post-card ${post.post_type}`}>
                  <span className={`post-type ${post.post_type}`}>
                    {post.post_type === 'motivational' && '🔥 Motivazionale'}
                    {post.post_type === 'educational' && '📚 Educativo'}
                    {post.post_type === 'promotional' && '🎯 Promozionale'}
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
                    📋 Copia caption
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
                  🎉 Hai appena risparmiato 30 minuti!
                </div>
                <div style={{color: '#555', lineHeight: '1.6'}}>
                  Tempo per scrivere 3 post manualmente: ~45 minuti<br/>
                  Tempo con FitContent AI: 2 minuti<br/>
                  <strong style={{color: '#2e7d32'}}>⏱️ Risparmio: 43 minuti</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* HERO SECTION */}
      <div style={{textAlign: 'center', color: 'white', marginBottom: '50px'}}>
        <h1 style={{fontSize: '3rem', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2'}}>
          💪 FitContent AI
        </h1>
        <p style={{fontSize: '1.3rem', opacity: 0.95, marginBottom: '10px'}}>
          Da sessione PT a 3 post Instagram in 10 secondi
        </p>
        <p style={{fontSize: '1rem', opacity: 0.8}}>
          Smetti di perdere ore a pensare cosa scrivere. L'AI lo fa per te.
        </p>
      </div>

      {/* BENEFICI ROI */}
      <div className="card" style={{marginBottom: '30px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '35px', color: '#333', fontSize: '1.8rem'}}>
          🎯 Cosa ottieni (numeri reali)
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {benefits.map((benefit, i) => (
            <div key={i} style={{
              background: '#f8f9ff',
              padding: '25px',
              borderRadius: '15px',
              border: '2px solid #e8eaff'
            }}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>{benefit.icon}</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '15px', color: '#333'}}>{benefit.title}</h3>
              
              <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '8px'}}>
                <strong>❌ {benefit.before}</strong>
              </div>
              <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '12px'}}>
                <strong style={{color: '#4caf50'}}>✅ {benefit.after}</strong>
              </div>
              
              <div style={{
                background: '#fff3cd',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#856404',
                fontWeight: '600'
              }}>
                💡 {benefit.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '30px',
          padding: '25px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px'}}>
            📊 Calcolo veloce del tuo ROI
          </div>
          <div style={{fontSize: '1.1rem', opacity: 0.95, lineHeight: '1.8'}}>
            Tempo risparmiato al mese: <strong>~20 ore</strong><br/>
            Valore del tuo tempo/ora: <strong>50€</strong><br/>
            Risparmio mensile: <strong>1.000€</strong><br/>
            <div style={{marginTop: '15px', fontSize: '1.3rem', fontWeight: '800'}}>
              🎯 Se conquisti anche solo 1 cliente in più = +500-1000€/mese
            </div>
          </div>
        </div>
      </div>

      {/* COMPARAZIONE */}
      <div className="card" style={{marginBottom: '30px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '15px', color: '#333', fontSize: '1.8rem'}}>
          ⚡ Fai da te VS FitContent AI
        </h2>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1rem'}}>
          La differenza è brutale (e tu lo sai)
        </p>

        {comparison.map((item, idx) => (
          <div key={idx} style={{marginBottom: '30px'}}>
            <h3 style={{
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '20px',
              padding: '12px 20px',
              background: '#f0f2ff',
              borderRadius: '10px',
              borderLeft: '5px solid #667eea'
            }}>
              {item.task}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {/* MANUALE */}
              <div style={{
                background: '#ffebee',
                padding: '25px',
                borderRadius: '15px',
                border: '2px solid #ef5350',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20px',
                  background: '#ef5350',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  ❌ FAI DA TE
                </div>

                <div style={{marginTop: '15px'}}>
                  <div style={{fontSize: '2rem', fontWeight: '800', color: '#c62828', marginBottom: '10px'}}>
                    ⏱️ {item.manual.time}
                  </div>
                  
                  <div style={{marginBottom: '15px'}}>
                    <strong style={{color: '#333', fontSize: '0.9rem'}}>I tuoi step:</strong>
                    <ul style={{marginTop: '8px', paddingLeft: '20px', color: '#555', fontSize: '0.9rem', lineHeight: '1.8'}}>
                      {item.manual.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    background: '#ffcdd2',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <strong style={{fontSize: '0.85rem', color: '#b71c1c'}}>Livello stress:</strong>
                    <div style={{fontSize: '1.5rem', marginTop: '5px'}}>{item.manual.frustration}</div>
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    color: '#c62828',
                    fontWeight: '700',
                    marginTop: '10px'
                  }}>
                    💸 Costo reale: {item.manual.cost}
                  </div>
                </div>
              </div>

              {/* CON AI */}
              <div style={{
                background: '#e8f5e9',
                padding: '25px',
                borderRadius: '15px',
                border: '2px solid #66bb6a',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20px',
                  background: '#66bb6a',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  ✅ CON FITCONTENT AI
                </div>

                <div style={{marginTop: '15px'}}>
                  <div style={{fontSize: '2rem', fontWeight: '800', color: '#2e7d32', marginBottom: '10px'}}>
                    ⚡ {item.withAI.time}
                  </div>
                  
                  <div style={{marginBottom: '15px'}}>
                    <strong style={{color: '#333', fontSize: '0.9rem'}}>I tuoi step:</strong>
                    <ul style={{marginTop: '8px', paddingLeft: '20px', color: '#555', fontSize: '0.9rem', lineHeight: '1.8'}}>
                      {item.withAI.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    background: '#c8e6c9',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <strong style={{fontSize: '0.85rem', color: '#1b5e20'}}>Livello stress:</strong>
                    <div style={{fontSize: '1.5rem', marginTop: '5px'}}>{item.withAI.frustration}</div>
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    color: '#2e7d32',
                    fontWeight: '700',
                    marginTop: '10px'
                  }}>
                    💸 Costo reale: {item.withAI.cost}
                  </div>
                </div>
              </div>
            </div>

            {/* Risparmio totale */}
            <div style={{
              marginTop: '15px',
              padding: '15px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              borderRadius: '10px',
              textAlign: 'center',
              fontWeight: '700',
              color: '#333',
              fontSize: '1rem'
            }}>
              💰 RISPARMIO: {item.manual.time.split('-')[0]} → {item.withAI.time} 
              {idx === 0 && ' (-95% tempo)'}
              {idx === 1 && ' (-97% tempo)'}
              {idx === 2 && ' (-98% tempo + 500€ del tuo tempo)'}
            </div>
          </div>
        ))}

        <div style={{
          marginTop: '30px',
          padding: '25px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px'}}>
            🧮 Il conto è presto fatto
          </div>
          <div style={{fontSize: '1.1rem', opacity: 0.95, lineHeight: '1.8'}}>
            12 post al mese fai da te: <strong>~10 ore</strong><br/>
            12 post con FitContent AI: <strong>24 minuti</strong><br/>
            <div style={{marginTop: '15px', fontSize: '1.4rem', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px'}}>
              ⏱️ Recuperi 9 ore e 36 minuti ogni mese<br/>
              💰 = Tempo per fare 15-20 sessioni PT in più = +750-2000€
            </div>
          </div>
        </div>
      </div>

      {/* WIZARD */}
      <div className="card">
        <h2 style={{textAlign: 'center', marginBottom: '15px', color: '#333', fontSize: '1.8rem'}}>
          🎓 Come funziona (4 step semplicissimi)
        </h2>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1rem'}}>
          Niente tecnicismi. Ti guidiamo passo passo.
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
          minHeight: '280px',
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
            💡 {steps[currentStep].example}
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
            ← Indietro
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
              Avanti →
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
              🚀 Inizia ora - Genera il tuo primo post!
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="card" style={{marginTop: '30px'}}>
        <h3 style={{textAlign: 'center', marginBottom: '25px', color: '#333'}}>
          ❓ Domande frequenti
        </h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          {[
            {
              q: 'Devo essere bravo a scrivere?',
              a: 'No! Scrivi 2 righe sgrammaticate, l\'AI sistema tutto e crea caption professionali.'
            },
            {
              q: 'Funziona anche se non ho foto/video?',
              a: 'Sì! Basta la descrizione testuale. La foto la aggiungi tu quando posti.'
            },
            {
              q: 'I post sono unici o copia-incolla?',
              a: 'Ogni post è generato su misura per te. Niente template preconfezionati.'
            },
            {
              q: 'Posso modificare i post generati?',
              a: 'Certo! Copi il testo e lo modifichi come vuoi prima di postare.'
            },
            {
              q: 'Quanto costa?',
              a: 'Versione MVP gratuita per testare. Piano PRO: 39€/mese per contenuti illimitati.'
            }
          ].map((faq, i) => (
            <div key={i} style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e8eaff'
            }}>
              <div style={{fontWeight: '700', color: '#333', marginBottom: '8px', fontSize: '1rem'}}>
                {faq.q}
              </div>
              <div style={{color: '#666', fontSize: '0.95rem', lineHeight: '1.6'}}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA FINALE */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{color: 'white', fontSize: '2rem', marginBottom: '15px'}}>
          Pronto a smettere di procrastinare sui contenuti?
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
          🚀 Inizia gratis ora
        </button>
      </div>
    </div>
  )
}