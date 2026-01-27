import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserProfile, checkProfileComplete } from '@/lib/auth-server';
import { isProfileComplete } from '@/lib/utils/profile';

/**
 * Layout do Dashboard - GraficaHub
 * 
 * Server Component que protege rotas do dashboard:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Verifica se o perfil está completo (campos obrigatórios preenchidos)
 * - Se não houver sessão → redirect para /login
 * - Se perfil incompleto → redirect para /setup/perfil
 * - Se houver usuário com perfil completo → renderiza o layout normalmente
 * 
 * Este é o ÚNICO guard que verifica perfil completo no sistema.
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

  // Verifica se o perfil está completo
  // Este é o ÚNICO guard que verifica perfil completo
  const profile = await getUserProfile(user.id);
  const profileIsComplete = isProfileComplete(profile);

  // Se o perfil não estiver completo, redireciona para completar cadastro
  if (!profileIsComplete) {
    redirect('/setup/perfil');
  }

  // Usuário autenticado com perfil completo → renderiza children normalmente
  // O layout visual (Sidebar, Header) será renderizado pelas páginas client-side
  return <>{children}</>;
}
