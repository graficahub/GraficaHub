'use client'

import AuthCard from '@/components/auth/AuthCard'

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Efeito vignette similar à Splash Screen */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)'
          }}
        />

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
