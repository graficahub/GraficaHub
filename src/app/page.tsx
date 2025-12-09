'use client'

import { useEffect } from 'react'
import SplashScreen from '@/components/SplashScreen'

export default function Home() {
  useEffect(() => {
    console.log('🏠 ==========================================')
    console.log('🏠 Home page renderizada - sempre mostra Splash Screen primeiro')
    console.log('🏠 A Splash Screen aparecerá por 5 segundos')
    console.log('🏠 Depois redirecionará para /auth')
    console.log('🏠 ==========================================')
  }, [])

  // Sempre mostra a Splash Screen na página inicial, independente do estado de autenticação
  // A Splash Screen redireciona para /auth após 5 segundos
  return <SplashScreen />
}
