'use client'

import AuthCard from '@/components/auth/AuthCard'

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Efeito vignette similar à Splash Screen */}

        {/* Container principal centralizado */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center gap-6">
          {/* Logo e subtexto */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide">
              GraficaHub
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Entre ou crie sua conta para começar.
            </p>
          </div>

          {/* Card de autenticação */}
          <AuthCard />
        </div>
      </main>
    </div>
  )
}
