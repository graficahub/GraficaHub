import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Layout do Dashboard - GraficaHub
 * 
 * Server Component que protege rotas do dashboard:
 * - Verifica sessão do Supabase Auth usando cookies
 * - Se não houver sessão → redirect para /login
 * - Se houver usuário (qualquer role) → renderiza o layout normalmente
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase não está configurado');
    redirect('/login');
  }

  // Cria cliente Supabase para server-side
  // O Supabase JS SDK v2+ suporta cookies automaticamente quando usado em Server Components
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookie = cookieStore.get(key);
          return cookie?.value ?? null;
        },
        setItem: () => {
          // Não faz nada em server component
        },
        removeItem: () => {
          // Não faz nada em server component
        },
      },
    },
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
