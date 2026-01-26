import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Layout do Dashboard - GraficaHub
 * 
 * Server Component que protege rotas do dashboard:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Se não houver sessão → redirect para /login
 * - Se houver usuário (qualquer role) → renderiza o layout normalmente
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase não está configurado');
    redirect('/login');
  }

  // Cria cliente Supabase para server-side usando cookies (auth-helpers)
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

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
  return <>{children}</>;
}
