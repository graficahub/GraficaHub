"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getUserRole } from "@/lib/auth";

/**
 * Layout do Painel Administrativo - GraficaHub
 * 
 * Client Component que protege rotas admin:
 * - Verifica sessão do Supabase Auth
 * - Busca role na tabela users
 * - Se não houver sessão → redirect para /login
 * - Se role !== 'admin' → redirect para /dashboard
 * - Apenas admins podem acessar
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkPermissions = async () => {
      try {
        const session = await getSession();

        if (!session) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        const userId = session.user.id;
        const role = await getUserRole(userId);
        console.log("🔐 Role do usuário no /admin:", role);

        if (cancelled) return;

        if (role === "admin") {
          setIsAllowed(true);
        } else {
          // usuário comum → manda para o dashboard (não /setup)
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Erro ao checar permissões do admin:", err);
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkPermissions();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Enquanto checa → só mostra o loading
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <p className="text-sm text-slate-300">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem permissão, o router.replace já está redirecionando.
  // Para evitar piscada do dashboard, não renderiza nada.
  if (!isAllowed) {
    return null;
  }

  // Admin autorizado → renderiza o painel normalmente
  return <>{children}</>;
}
