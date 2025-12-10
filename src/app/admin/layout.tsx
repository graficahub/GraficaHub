"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getUserRole } from "@/lib/auth";
import AdminSidebar, { AdminSidebarToggle } from '@/components/admin/AdminSidebar'
import AdminViewToggle from '@/components/admin/AdminViewToggle'

/**
 * Layout do Painel Administrativo - GraficaHub
 * 
 * Proteção de rotas:
 * - Verifica se há sessão ativa do Supabase Auth
 * - Busca a role do usuário na tabela users
 * - Se não houver sessão → redireciona para /login
 * - Se role !== 'admin' → redireciona para /setup
 * - Permite acesso apenas se role === 'admin'
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // 1) Verifica se tem sessão
      const session = await getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      // 2) Busca role na tabela users
      const role = await getUserRole(session.user.id);

      console.log("Role detectada no /admin:", role);

      if (role !== "admin") {
        // Qualquer coisa que NÃO seja admin vai para /setup
        router.replace("/setup");
        return;
      }

      // 3) Libera renderização do painel admin
      setAllowed(true);
      setChecking(false);
    };

    checkAccess();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    // Enquanto o router.replace não acontece, evita mostrar o admin
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <AdminSidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && <AdminSidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        {/* Header com toggle de visão */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-end">
            <AdminViewToggle />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
