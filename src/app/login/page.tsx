/**
 * Página de Login - GraficaHub
 * 
 * Fluxo de autenticação:
 * 1. Usuário preenche email e senha
 * 2. Chama signInWithEmail do Supabase Auth
 * 3. Em caso de sucesso, redireciona para /admin
 * 4. Em caso de erro, exibe mensagem amigável
 * 
 * Design reutiliza componentes e estilos do GraficaHub existente.
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { signInWithEmail } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    console.log('Enviando formulário de LOGIN', { email })

    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Chamando signInWithEmail do Supabase...')
      const response = await signInWithEmail(email, password)

      if (response.error) {
        console.error('Erro Supabase login', response.error)
        // Mensagens de erro amigáveis
        let errorMessage = 'Erro ao fazer login. Tente novamente.'
        
        if (response.error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
        } else if (response.error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.'
        } else {
          errorMessage = response.error.message || errorMessage
        }

        setError(errorMessage)
        setIsLoading(false)
        return
      }

      if (response.user && response.session) {
        console.log('✅ Login bem-sucedido! Redirecionando para /admin')
        // Login bem-sucedido - redireciona para o painel admin
        router.push('/admin')
      } else {
        console.error('❌ Login falhou: usuário ou sessão não retornados')
        setError('Erro ao fazer login. Tente novamente.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('❌ Erro no login:', err)
      console.error('Erro Supabase login', err)
      setError('Erro inesperado ao fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value)
    } else if (field === 'password') {
      setPassword(value)
    }

    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Efeito vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
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
              Entre na sua conta para continuar.
            </p>
          </div>

          {/* Card de login */}
          <Card className="w-full p-6">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Exibe erro geral */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
                disabled={isLoading}
              />

              <div>
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />

                <div className="mt-2 text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>

              {/* Link para registro */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Não tem uma conta?{' '}
                  <Link
                    href="/register"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 font-medium"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </motion.form>
          </Card>
        </div>
      </main>
    </div>
  )
}

