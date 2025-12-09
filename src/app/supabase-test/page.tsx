import { createClient } from "@supabase/supabase-js";

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .limit(1);

  return (
    <pre style={{ padding: "20px", fontSize: "16px" }}>
      {error
        ? "Erro: " + error.message
        : JSON.stringify(data, null, 2)}
    </pre>
  );
}

