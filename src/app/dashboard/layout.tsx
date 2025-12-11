import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getAuthCookieName } from '@/lib/supabaseClient';

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
  const authCookieName = `sb-${projectRef}-auth-token`;

  // Cria cliente Supabase para server-side
  // O Supabase JS SDK v2+ precisa de configuração manual de storage para Server Components
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          try {
            // O Supabase usa chaves específicas para armazenar tokens
            // Tenta diferentes formatos de chave que o Supabase pode usar
            const possibleKeys = [
              key,
              authCookieName,
              `sb-${projectRef}-auth-token`,
              `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`,
            ];
            
            for (const cookieKey of possibleKeys) {
              const cookie = cookieStore.get(cookieKey);
              if (cookie?.value) {
                console.log(`✅ DashboardLayout: Cookie encontrado: ${cookieKey}`);
                // Tenta fazer parse se for JSON
                try {
                  const parsed = JSON.parse(cookie.value);
                  // Se for um objeto de sessão, retorna o access_token
                  if (parsed && typeof parsed === 'object' && parsed.access_token) {
                    return parsed.access_token;
                  }
                } catch {
                  // Se não for JSON, retorna o valor direto
                }
                return cookie.value;
              }
            }
            
            // Se não encontrou com as chaves específicas, tenta buscar qualquer cookie que contenha 'auth' ou 'supabase'
            const allCookies = cookieStore.getAll();
            const authCookie = allCookies.find(c => 
              c.name.includes('auth') || 
              c.name.includes('supabase') ||
              c.name.includes('sb-')
            );
            
            if (authCookie) {
              console.log(`✅ DashboardLayout: Cookie de auth encontrado (genérico): ${authCookie.name}`);
              // Tenta fazer parse se for JSON
              try {
                const parsed = JSON.parse(authCookie.value);
                if (parsed && typeof parsed === 'object' && parsed.access_token) {
                  return parsed.access_token;
                }
              } catch {
                // Se não for JSON, retorna o valor direto
              }
              return authCookie.value;
            }
            
            console.log(`⚠️ DashboardLayout: Nenhum cookie de auth encontrado. Chaves tentadas:`, possibleKeys);
            console.log(`📋 Todos os cookies disponíveis:`, allCookies.map(c => c.name).join(', '));
            
            return null;
          } catch (err) {
            console.error('❌ DashboardLayout: Erro ao ler cookie:', err);
            return null;
          }
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

  // Tenta obter usuário
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Log para debug
  if (error) {
    console.error('❌ DashboardLayout: Erro ao buscar usuário:', error);
    console.error('❌ DashboardLayout: Detalhes do erro:', JSON.stringify(error, null, 2));
  }

  if (!user) {
    console.log('❌ DashboardLayout: Nenhum usuário autenticado, redirecionando para /login');
    console.log('📋 DashboardLayout: Cookie esperado:', authCookieName);
    redirect('/login');
  }

  console.log('✅ DashboardLayout: Usuário autenticado:', user.email);

  // Usuário autenticado → renderiza children normalmente
  // O layout visual (Sidebar, Header) será renderizado pelas páginas client-side
  return <>{children}</>;
}
