import { redirect } from 'next/navigation'

/**
 * Página inicial do GraficaHub
 * 
 * Redireciona automaticamente para /login
 * Esta é uma Server Component que usa redirect do Next.js
 */
export default function HomePage() {
  redirect('/login')
}
