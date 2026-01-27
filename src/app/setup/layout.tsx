import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth-server';

/**
 * Layout do Setup - GraficaHub
 * 
 * Server Component que protege rotas do setup:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Se não houver sessão → redirect para /login
 * - Permite acesso sem verificar perfil completo (pois /setup/perfil é onde completa)
 */
export default async function SetupLayout({ children }: { children: ReactNode }) {
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

  // Usuário autenticado → permite acesso às páginas de setup
  return <>{children}</>;
}
