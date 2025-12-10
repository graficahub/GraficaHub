import { createClient } from "@supabase/supabase-js";

export default async function Page() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Verifica se as variáveis de ambiente estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div style={{ padding: "20px", fontSize: "16px" }}>
        <h1 style={{ color: "#ef4444", marginBottom: "16px" }}>⚠️ Configuração do Supabase Necessária</h1>
        <p style={{ color: "#64748b", marginBottom: "8px" }}>
          Para testar a conexão com o Supabase, configure as seguintes variáveis de ambiente:
        </p>
        <ul style={{ color: "#64748b", marginLeft: "20px" }}>
          <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
        </ul>
        <p style={{ color: "#64748b", marginTop: "16px" }}>
          Crie um arquivo <code>.env.local</code> na raiz do projeto com essas variáveis.
        </p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .limit(1);

  return (
    <div style={{ padding: "20px", fontSize: "16px", backgroundColor: "#0f172a", color: "#e2e8f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#3b82f6", marginBottom: "16px" }}>🔌 Teste de Conexão Supabase</h1>
      {error ? (
        <div>
          <h2 style={{ color: "#ef4444", marginBottom: "8px" }}>❌ Erro:</h2>
          <pre style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", overflow: "auto" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <div>
          <h2 style={{ color: "#10b981", marginBottom: "8px" }}>✅ Conexão bem-sucedida!</h2>
          <p style={{ color: "#64748b", marginBottom: "8px" }}>Dados retornados da tabela "users":</p>
          <pre style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", overflow: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

