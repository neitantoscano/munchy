import { createClient } from '@supabase/supabase-js'

// Cliente "admin" con la llave maestra (service_role).
// Salta la seguridad RLS, por eso SOLO se usa en el webhook de pagos.
// NUNCA usar este cliente en endpoints de usuario.
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de Supabase admin (URL o SERVICE_ROLE_KEY)')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
