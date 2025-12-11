import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Valida que as variáveis de ambiente estão configuradas
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Extrai o project ref da URL para usar no nome do cookie
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

// Cria o cliente Supabase com configuração para usar cookies
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        // Tenta ler do cookie primeiro
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
        if (cookie) {
          return decodeURIComponent(cookie.split('=')[1]);
        }
        // Fallback para localStorage (compatibilidade)
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        // Salva no cookie (para Server Components poderem ler)
        const expires = new Date();
        expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 ano
        document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        // Também salva no localStorage (compatibilidade)
        try {
          localStorage.setItem(key, value);
        } catch {
          // Ignora erros de localStorage
        }
      },
      removeItem: (key: string) => {
        // Remove do cookie
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Remove do localStorage também
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignora erros
        }
      },
    } : undefined, // No server-side, não configura storage (será configurado no Server Component)
  },
});

// Helper para obter o nome do cookie de auth
export const getAuthCookieName = () => authCookieName;
