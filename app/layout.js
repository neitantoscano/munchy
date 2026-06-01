export const metadata = {
  title: 'Munchy',
  description: 'Antojos Saludables',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
