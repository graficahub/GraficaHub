'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    console.log('🎬 SplashScreen: Componente renderizado')
    console.log('⏱️ SplashScreen: Iniciando timer de 5 segundos...')
    
    // Fade-out após 5 segundos e redirecionamento
    const timer = setTimeout(() => {
      console.log('🔄 SplashScreen: Iniciando fade-out...')
      setIsExiting(true)
      // Aguarda a animação de fade-out terminar antes de redirecionar
      setTimeout(() => {
        console.log('➡️ SplashScreen: Redirecionando para /auth')
        // Usa replace para evitar problemas de histórico
        router.replace('/auth')
      }, 800) // Duração da animação de fade-out
    }, 5000) // Tempo total: 5 segundos

    return () => {
      console.log('🧹 SplashScreen: Limpando timer')
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div 
      className="fixed inset-0 min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ 
        zIndex: 99999,
        backgroundColor: '#0f172a',
        backgroundImage: 'linear-gradient(to bottom right, #020617, #1e293b, #334155)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Efeito vignette - mais escuro nas bordas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)'
        }}
      />

      {/* Conteúdo principal com animações */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -10 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: isExiting ? 0.8 : 0.9,
          ease: 'easeOut'
        }}
        className="relative z-10 text-center px-6 flex flex-col items-center justify-center"
      >
        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -10 : 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide mb-4"
          style={{
            fontWeight: 700,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
            letterSpacing: '0.05em',
            color: '#ffffff'
          }}
        >
          GraficaHub
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isExiting ? 0 : 0.85, y: isExiting ? -10 : 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
          className="text-sm md:text-base text-slate-300 font-light leading-relaxed"
          style={{
            fontWeight: 300,
            letterSpacing: '0.02em',
            color: '#cbd5e1'
          }}
        >
          A ponte entre gráficas e oportunidades reais.
        </motion.p>

        {/* Linha sutil abaixo do subtítulo */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: isExiting ? 0 : 0.4, width: isExiting ? 0 : '120px' }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="mx-auto mt-6 h-px"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        />
      </motion.div>
    </div>
  )
}
