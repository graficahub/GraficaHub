import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth-server';

/**
 * Layout do Perfil - GraficaHub
 * 
 * Server Component que protege rotas do perfil:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Se não houver sessão → redirect para /login
 * - Se houver usuário → permite acesso (não verifica perfil completo aqui)
 */
export default async function PerfilLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  
  if (!supabase) {
    console.error('Supabase não está configurado');
    redirect('/login');
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Se não houver usuário ou erro, redireciona para login
  if (error || !user) {
    redirect('/login');
  }

  // Usuário autenticado → permite acesso às páginas de perfil
  return <>{children}</>;
}
