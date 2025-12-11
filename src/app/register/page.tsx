/**
 * Página de Registro - GraficaHub
 * 
 * Fluxo de cadastro:
 * 1. Usuário preenche nome, email e senha
 * 2. Chama signUpWithEmail do Supabase Auth
 * 3. Após cadastro bem-sucedido, insere registro na tabela public.users
 * 4. Em caso de sucesso, redireciona para /admin
 * 5. Em caso de erro, exibe mensagem amigável
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
import { signUpWithEmail, getUserRole } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

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
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Enviando formulário de REGISTRO", { email, name });

      const { data, error } = await signUpWithEmail(name, email, password);

      if (error || !data?.user) {
        console.error("Erro Supabase registro", error);
        // Mensagens de erro amigáveis
        let errorMessage = 'Erro ao criar conta. Tente novamente.';
        
        if (error?.message?.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
        } else if (error?.message?.includes('Password')) {
          errorMessage = 'A senha não atende aos requisitos de segurança.';
        } else {
          errorMessage = error?.message || errorMessage;
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError('Erro inesperado ao obter usuário.');
        setIsLoading(false);
        return;
      }

      console.log("✅ Cadastro ok, buscando role...");

      const role = await getUserRole(userId);
      console.log("Role após cadastro:", role);

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/setup"); // usuário comum vai completar cadastro
      }
    } catch (err) {
      console.error("Erro inesperado no registro:", err);
      setError("Erro inesperado ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'name') {
      setName(value)
    } else if (field === 'email') {
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
              Crie sua conta para começar.
            </p>
          </div>

          {/* Card de registro */}
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
                label="Nome completo"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                autoComplete="name"
                required
                disabled={isLoading}
              />

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

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </div>

              {/* Link para login */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Já tem uma conta?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 font-medium"
                  >
                    Fazer login
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

