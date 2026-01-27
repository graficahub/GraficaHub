import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth-server';

/**
 * Layout do Dashboard - GraficaHub
 * 
 * Server Component que protege rotas do dashboard:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Se não houver sessão → redirect para /login
 * - Se houver usuário autenticado → renderiza o layout normalmente
 * 
 * Não bloqueia acesso por perfil incompleto - usuário pode completar depois.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  // Usuário autenticado → renderiza children normalmente
  // O layout visual (Sidebar, Header) será renderizado pelas páginas client-side
  // Não verifica perfil completo - permite acesso mesmo com perfil incompleto
  return <>{children}</>;
}
