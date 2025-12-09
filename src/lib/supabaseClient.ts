'use client'

import { createClient } from '@supabase/supabase-js'

// Função para criar o cliente Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log de debug (sem expor a chave completa)
  console.log('🔧 Configuração Supabase:', {
    urlExists: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    keyExists: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are missing!')
    console.warn('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
        }
      }
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

// Exporta o cliente criado
export const supabase = createSupabaseClient()
