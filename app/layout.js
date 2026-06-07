import './globals.css';

export const metadata = {
  title: 'Munchy',
  description: 'Antojos saludables para Gen Z',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#2e3a23',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
