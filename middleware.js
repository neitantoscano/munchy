import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// MIDDLEWARE: se ejecuta en cada visita y refresca la sesión de Supabase.
// Sin este archivo, la sesión no se guarda y el usuario aparece como nuevo cada vez.
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: esta línea refresca la sesión en cada visita.
  await supabase.auth.getUser()

  return supabaseResponse
}

// Define en qué rutas corre el middleware.
// Excluye archivos estáticos (imágenes, iconos) para no gastar recursos de más.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
