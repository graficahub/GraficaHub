'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { maskCpfCnpj, maskPhone, maskCEP } from '@/lib/utils/masks'
import { validateCpfCnpj, validatePhone, validateCep, validateAddress, removeMask } from '@/lib/utils/validation'
import { isProfileComplete } from '@/lib/utils/profile'

export default function CompletarPerfilPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Campos do formulário
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [cep, setCep] = useState('')
  
  // Erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    async function loadUserProfile() {
      if (!supabase) {
        setError('Supabase não está configurado')
        setIsLoading(false)
        return
      }

      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.replace('/login')
          return
        }

        // Busca perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('email, name, cpf_cnpj, phone, address, cep')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          setError('Erro ao carregar dados do perfil')
          setIsLoading(false)
          return
        }

        // Preenche campos com dados existentes
        if (profile) {
          setEmail(profile.email || '')
          setName(profile.name || '')
          setCpfCnpj(profile.cpf_cnpj || '')
          setPhone(profile.phone || '')
          setAddress(profile.address || '')
          setCep(profile.cep || '')
        }

        // Verifica se o perfil já está completo
        if (isProfileComplete(profile)) {
          router.replace('/dashboard')
          return
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError('Erro ao carregar dados do perfil')
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Valida nome
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    // Valida email
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    // Valida CPF/CNPJ
    const cpfCnpjValidation = validateCpfCnpj(cpfCnpj)
    if (!cpfCnpjValidation.isValid) {
      newErrors.cpfCnpj = cpfCnpjValidation.error || 'CPF/CNPJ inválido'
    }

    // Valida telefone
    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'Telefone inválido'
    }

    // Valida endereço
    const addressValidation = validateAddress(address)
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error || 'Endereço inválido'
    }

    // Valida CEP
    const cepValidation = validateCep(cep)
    if (!cepValidation.isValid) {
      newErrors.cep = cepValidation.error || 'CEP inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submete o formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    if (!supabase) {
      setError('Supabase não está configurado')
      return
    }

    setIsSaving(true)

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        setError('Usuário não autenticado')
        setIsSaving(false)
        router.replace('/login')
        return
      }

      // Remove máscaras antes de salvar
      const cpfCnpjCleaned = removeMask(cpfCnpj)
      const phoneCleaned = removeMask(phone)
      const cepCleaned = removeMask(cep)

      // Atualiza perfil do usuário
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          email: email.trim(),
          cpf_cnpj: cpfCnpjCleaned,
          phone: phoneCleaned,
          address: address.trim(),
          cep: cepCleaned,
        })
        .eq('id', authUser.id)

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError)
        setError('Erro ao salvar dados. Tente novamente.')
        setIsSaving(false)
        return
      }

      // Redireciona para o dashboard
      router.replace('/dashboard')
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setError('Erro ao salvar dados. Tente novamente.')
      setIsSaving(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          <Card className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cabeçalho */}
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Complete seu cadastro
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Preencha os dados obrigatórios para acessar o sistema completamente.
                </p>
              </div>

              {/* Erro geral */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Campos do formulário */}
              <div className="space-y-4">
                <Input
                  label="Nome *"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email *"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  error={errors.email}
                  required
                />

                <Input
                  label="CPF/CNPJ *"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={cpfCnpj}
                  onChange={(e) => {
                    const masked = maskCpfCnpj(e.target.value)
                    setCpfCnpj(masked)
                    if (errors.cpfCnpj) {
                      setErrors(prev => ({ ...prev, cpfCnpj: '' }))
                    }
                  }}
                  error={errors.cpfCnpj}
                  required
                />

                <Input
                  label="Telefone *"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value)
                    setPhone(masked)
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: '' }))
                    }
                  }}
                  error={errors.phone}
                  required
                />

                <Input
                  label="Endereço *"
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (errors.address) {
                      setErrors(prev => ({ ...prev, address: '' }))
                    }
                  }}
                  error={errors.address}
                  required
                />

                <Input
                  label="CEP *"
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => {
                    const masked = maskCEP(e.target.value)
                    setCep(masked)
                    if (errors.cep) {
                      setErrors(prev => ({ ...prev, cep: '' }))
                    }
                  }}
                  error={errors.cep}
                  required
                />
              </div>

              {/* Botão salvar */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar e continuar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
