'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register, isLoading, error: authError, clearError } = useAuth()
  const [formData, setFormData] = useState({
    companyName: '',
    cpfCnpj: '',
    phone: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Limpa erros quando troca de modo (login/cadastro)
  useEffect(() => {
    setErrors({})
    clearError()
  }, [mode, clearError])

  // Log de erro do hook quando existir
  useEffect(() => {
    if (authError) {
      console.error('🚨 Erro de autenticação exibido na tela:', authError)
    }
  }, [authError])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mode === 'register' && !formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório'
    }

    if (mode === 'register' && !formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    }

    if (mode === 'register' && !formData.phone.trim()) {
      newErrors.phone = 'Celular é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('✅ Validação do formulário:', { isValid, errors: newErrors })
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('📤 Formulário submetido', { mode, formData: { ...formData, password: '***' } })
    
    if (!validateForm()) {
      console.log('❌ Validação falhou', errors)
      return
    }

    console.log('🚀 Iniciando autenticação...')
    try {
      if (mode === 'login') {
        console.log('🔐 Tentando fazer login...')
        await login(formData.email, formData.password)
        console.log('✅ Login concluído com sucesso!')
      } else {
        console.log('📝 Tentando criar conta...')
        await register(
          formData.companyName,
          formData.email,
          formData.password,
          formData.cpfCnpj,
          formData.phone
        )
        console.log('✅ Cadastro concluído com sucesso!')
      }
    } catch (error) {
      // Erros são tratados no hook useAuth e exibidos via authError
      console.error('❌ Erro capturado no formulário:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key={mode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Exibe erro geral do hook useAuth */}
        {authError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{authError}</p>
          </div>
        )}

        {mode === 'register' && (
          <Input
            label="Nome da empresa"
            type="text"
            placeholder="Digite o nome da sua empresa"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            error={errors.companyName}
            autoComplete="organization"
            required
          />
        )}

        {mode === 'register' && (
          <Input
            label="CPF/CNPJ"
            type="text"
            placeholder="Digite o CPF ou CNPJ"
            value={formData.cpfCnpj}
            onChange={(e) => handleChange('cpfCnpj', e.target.value)}
            error={errors.cpfCnpj}
            required
          />
        )}

        {mode === 'register' && (
          <Input
            label="Celular"
            type="tel"
            placeholder="Digite o celular"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            required
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />

        <div>
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          
          {/* Link "Esqueceu a senha?" apenas no modo Login */}
          {mode === 'login' && (
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
              >
                Esqueceu a senha?
              </Link>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'login' ? 'Entrando...' : 'Criando...') 
              : (mode === 'login' ? 'Entrar' : 'Criar conta')
            }
          </Button>
        </div>

        {/* Informação sobre login de admin */}
        {mode === 'login' && (
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-400">
              Se você é administrador, use{' '}
              <span className="text-blue-400 font-medium">admin@graficahub.com.br</span>{' '}
              para acessar o painel de controle.
            </p>
          </div>
        )}
      </motion.form>
    </AnimatePresence>
  )
}
