'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Address } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()

  // Estados de autenticação com Supabase
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Estados do formulário
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Estados de validação e feedback
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Verificação de autenticação com Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Não há sessão → redireciona para login
          router.replace('/login')
          return
        }

        // Há sessão → usuário autenticado
        setIsAuthenticated(true)
        setIsCheckingAuth(false)
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  // Carrega dados do usuário ao montar o componente (apenas após autenticação confirmada)
  useEffect(() => {
    if (isAuthenticated && user) {
      setDisplayName(user.displayName || user.companyName)
      setPhone(user.phone || '')
      setAddress(user.address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      })
      setLogoUrl(user.logoUrl)
      setLogoPreview(user.logoUrl)
    }
  }, [user, isAuthenticated])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!displayName.trim()) {
      newErrors.displayName = 'Nome da gráfica é obrigatório'
    }

    if (address.street && !address.number) {
      newErrors.addressNumber = 'Número é obrigatório quando há endereço'
    }

    if (address.number && !address.street) {
      newErrors.addressStreet = 'Rua é obrigatória quando há endereço'
    }

    if (address.street || address.number) {
      if (!address.city) {
        newErrors.addressCity = 'Cidade é obrigatória'
      }
      if (!address.state) {
        newErrors.addressState = 'Estado é obrigatório'
      }
      if (!address.zipCode) {
        newErrors.addressZipCode = 'CEP é obrigatório'
      }
      if (!address.neighborhood) {
        newErrors.addressNeighborhood = 'Bairro é obrigatório'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler para upload de logo
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valida tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setSaveError('Por favor, selecione um arquivo de imagem')
      return
    }

    // Valida tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('A imagem deve ter no máximo 2MB')
      return
    }

    // Converte para Data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
      setLogoPreview(dataUrl)
      setSaveError(null)
    }
    reader.onerror = () => {
      setSaveError('Erro ao ler o arquivo. Tente novamente.')
    }
    reader.readAsDataURL(file)
  }

  // Handler para remover logo
  const handleRemoveLogo = () => {
    setLogoUrl(null)
    setLogoPreview(null)
    // Limpa o input file
    const fileInput = document.getElementById('logo-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Handler para salvar
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      // Constrói o objeto de endereço (null se não preenchido)
      const addressData: Address | null = 
        address.street && address.number && address.city && address.state && address.zipCode
          ? {
              street: address.street.trim(),
              number: address.number.trim(),
              complement: address.complement?.trim() || undefined,
              neighborhood: address.neighborhood.trim(),
              city: address.city.trim(),
              state: address.state.trim(),
              zipCode: address.zipCode.trim(),
            }
          : null

      // Atualiza o usuário
      await updateUser({
        displayName: displayName.trim(),
        phone: phone.trim() || null,
        address: addressData,
        logoUrl: logoUrl,
      })

      setSaveSuccess(true)
      setIsSaving(false)

      // Remove mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      setSaveError('Erro ao salvar configurações. Tente novamente.')
      setIsSaving(false)
    }
  }

  // Loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <main className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-300">Verificando autenticação...</p>
          </div>
        </main>
      </div>
    )
  }

  // Se não estiver autenticado, não renderiza (já foi redirecionado)
  if (!isAuthenticated) {
    return null
  }

  // Loading enquanto carrega dados do usuário
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <main className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando configurações...</p>
          </div>
        </main>
      </div>
    )
  }

  // Se não houver dados do usuário ainda, mostra loading
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <main className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando dados do usuário...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Efeito vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)'
        }}
      />

      <main className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Configurações da Gráfica
                </h1>
                <p className="text-slate-400 mt-1">
                  Atualize as informações da sua empresa, endereço e identidade visual.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Voltar ao painel
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo principal */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mensagens de feedback */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <p className="text-sm text-green-400">✓ Configurações salvas com sucesso.</p>
                </motion.div>
              )}

              {saveError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{saveError}</p>
                </div>
              )}

              {/* Seção 1: Identificação */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Identificação
                </h2>

                <Input
                  label="Nome da gráfica"
                  type="text"
                  placeholder="Digite o nome da sua gráfica"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    if (errors.displayName) {
                      setErrors(prev => ({ ...prev, displayName: '' }))
                    }
                  }}
                  error={errors.displayName}
                  required
                />

                <Input
                  label="Email de contato"
                  type="email"
                  value={user.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />

                <Input
                  label="Telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Seção 2: Endereço */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Endereço completo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Rua"
                      type="text"
                      placeholder="Nome da rua"
                      value={address.street}
                      onChange={(e) => {
                        setAddress({ ...address, street: e.target.value })
                        if (errors.addressStreet) {
                          setErrors(prev => ({ ...prev, addressStreet: '' }))
                        }
                      }}
                      error={errors.addressStreet}
                    />
                  </div>
                  <Input
                    label="Número"
                    type="text"
                    placeholder="123"
                    value={address.number}
                    onChange={(e) => {
                      setAddress({ ...address, number: e.target.value })
                      if (errors.addressNumber) {
                        setErrors(prev => ({ ...prev, addressNumber: '' }))
                      }
                    }}
                    error={errors.addressNumber}
                  />
                </div>

                <Input
                  label="Complemento"
                  type="text"
                  placeholder="Apto, sala, etc. (opcional)"
                  value={address.complement || ''}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                />

                <Input
                  label="Bairro"
                  type="text"
                  placeholder="Nome do bairro"
                  value={address.neighborhood}
                  onChange={(e) => {
                    setAddress({ ...address, neighborhood: e.target.value })
                    if (errors.addressNeighborhood) {
                      setErrors(prev => ({ ...prev, addressNeighborhood: '' }))
                    }
                  }}
                  error={errors.addressNeighborhood}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Cidade"
                    type="text"
                    placeholder="Nome da cidade"
                    value={address.city}
                    onChange={(e) => {
                      setAddress({ ...address, city: e.target.value })
                      if (errors.addressCity) {
                        setErrors(prev => ({ ...prev, addressCity: '' }))
                      }
                    }}
                    error={errors.addressCity}
                  />
                  <Input
                    label="Estado"
                    type="text"
                    placeholder="UF"
                    value={address.state}
                    onChange={(e) => {
                      setAddress({ ...address, state: e.target.value.toUpperCase() })
                      if (errors.addressState) {
                        setErrors(prev => ({ ...prev, addressState: '' }))
                      }
                    }}
                    error={errors.addressState}
                    maxLength={2}
                  />
                  <Input
                    label="CEP"
                    type="text"
                    placeholder="00000-000"
                    value={address.zipCode}
                    onChange={(e) => {
                      setAddress({ ...address, zipCode: e.target.value })
                      if (errors.addressZipCode) {
                        setErrors(prev => ({ ...prev, addressZipCode: '' }))
                      }
                    }}
                    error={errors.addressZipCode}
                  />
                </div>
              </div>

              {/* Seção 3: Identidade visual */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Identidade visual
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Logo da empresa
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB.
                      {/* Nota: A logo está sendo salva como Data URL no localStorage por enquanto (apenas para prototipagem). */}
                    </p>
                    
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="logo-input"
                        className="cursor-pointer px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm font-medium"
                      >
                        Selecionar imagem
                      </label>
                      
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pré-visualização da logo */}
                  {logoPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">Pré-visualização:</p>
                      <div className="w-32 h-32 rounded-lg border border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo da empresa"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => router.push('/dashboard')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

