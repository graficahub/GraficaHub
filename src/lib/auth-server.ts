/**
 * Funções de autenticação para Server Components
 * Usa createServerClient do @supabase/ssr
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { UserProfile } from './utils/profile';
import { isProfileComplete } from './utils/profile';

/**
 * Cria cliente Supabase para Server Components
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Server Components não podem setar cookies
      },
      remove() {
        // Server Components não podem remover cookies
      },
    },
  });
}

/**
 * Busca o perfil do usuário na tabela users
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('email, name, cpf_cnpj, phone, address, cep')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }

  return data;
}

/**
 * Verifica se o usuário autenticado tem perfil completo
 */
export async function checkProfileComplete(): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return false;
  }

  const profile = await getUserProfile(user.id);
  return isProfileComplete(profile);
}
