import ContentGenerator from '@/components/ContentGenerator'

export default function Home() {
  return (
    <div className="container">
      <div style={{textAlign: 'center', color: 'white', marginBottom: '40px'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px'}}>
          💪 FitContent AI
        </h1>
        <p style={{fontSize: '1.1rem', opacity: 0.9}}>
          Trasforma le tue sessioni in contenuti pronti da postare
        </p>
      </div>

      <div className="card">
        <ContentGenerator />
      </div>
    </div>
  )
}