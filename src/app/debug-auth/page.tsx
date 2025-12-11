import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

/**
 * Página de Debug de Autenticação
 * 
 * Mostra informações sobre a sessão atual do Supabase Auth
 * Útil para diagnosticar problemas de autenticação
 */
export default async function DebugAuthPage() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-2xl font-bold mb-4 text-red-400">❌ Erro de Configuração</h1>
        <p>Variáveis de ambiente do Supabase não estão configuradas.</p>
      </div>
    );
  }

  // Lista todos os cookies disponíveis
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('supabase') || 
    cookie.name.includes('sb-') ||
    cookie.name.includes('auth')
  );

  // Cria cliente Supabase
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

  // Tenta obter usuário
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Tenta obter sessão
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug de Autenticação</h1>
        
        {/* Status do Usuário */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status do Usuário</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ Usuário autenticado</p>
              <div className="bg-slate-800 p-4 rounded mt-4">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email Verificado:</strong> {user.email_confirmed_at ? 'Sim' : 'Não'}</p>
                <p><strong>Criado em:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-400">❌ Nenhum usuário autenticado</p>
              {userError && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded mt-4">
                  <p className="text-red-400"><strong>Erro:</strong></p>
                  <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(userError, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status da Sessão */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status da Sessão</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ Sessão ativa</p>
              <div className="bg-slate-800 p-4 rounded mt-4">
                <p><strong>Access Token:</strong> {session.access_token ? `${session.access_token.substring(0, 20)}...` : 'N/A'}</p>
                <p><strong>Refresh Token:</strong> {session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : 'N/A'}</p>
                <p><strong>Expira em:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-400">❌ Nenhuma sessão ativa</p>
              {sessionError && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded mt-4">
                  <p className="text-red-400"><strong>Erro:</strong></p>
                  <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(sessionError, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cookies do Supabase */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cookies Relacionados ao Supabase</h2>
          {supabaseCookies.length > 0 ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ {supabaseCookies.length} cookie(s) encontrado(s)</p>
              <div className="bg-slate-800 p-4 rounded mt-4 space-y-2">
                {supabaseCookies.map((cookie, idx) => (
                  <div key={idx} className="border-b border-slate-700 pb-2">
                    <p><strong>Nome:</strong> {cookie.name}</p>
                    <p><strong>Valor:</strong> {cookie.value.length > 50 ? `${cookie.value.substring(0, 50)}...` : cookie.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-red-400">❌ Nenhum cookie do Supabase encontrado</p>
          )}
        </div>

        {/* Todos os Cookies */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Todos os Cookies ({allCookies.length})</h2>
          {allCookies.length > 0 ? (
            <div className="bg-slate-800 p-4 rounded mt-4 space-y-2 max-h-96 overflow-auto">
              {allCookies.map((cookie, idx) => (
                <div key={idx} className="border-b border-slate-700 pb-2 text-sm">
                  <p><strong>{cookie.name}:</strong> {cookie.value.length > 100 ? `${cookie.value.substring(0, 100)}...` : cookie.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Nenhum cookie encontrado</p>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Ir para Login
          </a>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Ir para Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

