import './globals.css'

export const metadata = {
  title: 'FitContent AI - Content Generator per PT',
  description: 'Genera contenuti Instagram professionali in pochi click',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}