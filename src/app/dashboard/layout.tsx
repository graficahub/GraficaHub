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
    console.error('❌ DashboardLayout: Supabase não está configurado');
    redirect('/login');
  }

  // Extrai o project ref da URL para construir o nome do cookie
  const getProjectRef = (url: string): string => {
    try {
      const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
      return match ? match[1] : 'default';
    } catch {
      return 'default';
    }
  };

  const projectRef = getProjectRef(supabaseUrl);

  // Cria cliente Supabase para server-side com configuração de cookies
  // O Supabase usa cookies com nomes específicos baseados no project ref
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          // Tenta ler o cookie com o nome exato
          let cookie = cookieStore.get(key);
          if (cookie?.value) {
            return cookie.value;
          }
          
          // Tenta ler cookies do Supabase com diferentes formatos
          const possibleKeys = [
            key,
            `sb-${projectRef}-auth-token`,
            `sb-${projectRef}-auth-token-code-verifier`,
          ];
          
          for (const cookieKey of possibleKeys) {
            cookie = cookieStore.get(cookieKey);
            if (cookie?.value) {
              // Se for JSON, tenta fazer parse
              try {
                const parsed = JSON.parse(cookie.value);
                if (parsed && typeof parsed === 'object' && parsed.access_token) {
                  return parsed.access_token;
                }
              } catch {
                // Se não for JSON, retorna o valor direto
              }
              return cookie.value;
            }
          }
          
          return null;
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

  // Tenta obter sessão primeiro (pode funcionar melhor com cookies)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Se não houver sessão, tenta obter usuário diretamente
  if (!session) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Se não houver usuário ou erro, redireciona para login
    if (userError || !user) {
      if (userError) {
        console.error('❌ DashboardLayout: Erro ao buscar usuário:', userError.message);
      }
      redirect('/login');
    }
  } else if (sessionError) {
    console.error('❌ DashboardLayout: Erro ao buscar sessão:', sessionError.message);
    redirect('/login');
  }

  // Usuário autenticado → renderiza children normalmente
  // O layout visual (Sidebar, Header) será renderizado pelas páginas client-side
  return <>{children}</>;
}
