'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, Printer } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { loadUserActiveMaterials } from '@/utils/userMaterials'

// Opções pré-definidas
const WIDTH_OPTIONS = [
  { value: '0,60m', label: '0,60m' },
  { value: '1,00m', label: '1,00m' },
  { value: '1,20m', label: '1,20m' },
  { value: '1,60m', label: '1,60m' },
  { value: '1,80m', label: '1,80m' },
  { value: '2,00m', label: '2,00m' },
  { value: '2,50m', label: '2,50m' },
  { value: '3,20m', label: '3,20m' },
  { value: '5,00m', label: '5,00m' },
]

const INK_TECHNOLOGY_OPTIONS = [
  { value: 'Sublimação', label: 'Sublimação' },
  { value: 'EcoSolvente/Solvente', label: 'EcoSolvente/Solvente' },
  { value: 'UV', label: 'UV' },
  { value: 'DTF', label: 'DTF' },
  { value: 'DTF-UV', label: 'DTF-UV' },
]

export default function SetupPage() {
  const { user, isLoading: authLoading, updateUser } = useAuth()
  const router = useRouter()

  // Estado do formulário
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [printers, setPrinters] = useState<Printer[]>([
    {
      id: Date.now().toString(),
      name: '',
      width: '',
      inkTechnology: '',
    }
  ])

  // Estado de validação e erros
  const [errors, setErrors] = useState<{
    cpfCnpj?: string
    phone?: string
    printers?: string
  }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Proteção de rota: redireciona se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🚫 Usuário não autenticado, redirecionando para /login')
      router.replace('/login')
    } else if (!authLoading && user) {
      // Preenche os campos se já tiver dados parciais (apenas na primeira vez)
      // Evita resetar o estado se o usuário já começou a preencher
      setCpfCnpj(prev => prev || user.cpfCnpj || '')
      setPhone(prev => prev || user.phone || '')
      if (user.printers && user.printers.length > 0) {
        setPrinters(user.printers)
      }
    }
  }, [user, authLoading, router])

  // Gera um ID único para nova impressora
  const generatePrinterId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Adiciona uma nova impressora
  const handleAddPrinter = () => {
    setPrinters([
      ...printers,
      {
        id: generatePrinterId(),
        name: '',
        width: '',
        inkTechnology: '',
      }
    ])
    // Limpa erro de impressoras ao adicionar
    if (errors.printers) {
      setErrors(prev => ({ ...prev, printers: undefined }))
    }
  }

  // Remove uma impressora
  const handleRemovePrinter = (printerId: string) => {
    if (printers.length <= 1) {
      // Não permite remover se for a única
      return
    }
    setPrinters(printers.filter(p => p.id !== printerId))
  }

  // Atualiza um campo de uma impressora específica
  const handlePrinterChange = (printerId: string, field: keyof Printer, value: string) => {
    setPrinters(printers.map(p => 
      p.id === printerId ? { ...p, [field]: value } : p
    ))
    // Limpa erro ao editar
    if (errors.printers) {
      setErrors(prev => ({ ...prev, printers: undefined }))
    }
  }

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    // Valida CPF/CNPJ e celular (dados mínimos)
    if (!cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Celular é obrigatório'
    }

    // Impressoras são opcionais, mas se houver preenchimento parcial, valida
    const partialPrinters = printers.filter(p =>
      (p.width && p.width.trim() !== '') !== (p.inkTechnology && p.inkTechnology.trim() !== '')
    )

    if (partialPrinters.length > 0) {
      newErrors.printers = 'Todas as impressoras devem ter largura e tecnologia preenchidos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salva os dados
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    console.log('📤 Submetendo formulário de onboarding')
    console.log('📋 Estado atual:', { cpfCnpj, printersCount: printers.length, printers })

    // Valida o formulário antes de prosseguir
    const isValid = validateForm()
    if (!isValid) {
      console.log('❌ Validação falhou', errors)
      return
    }

    setIsSaving(true)

    try {
      // Prepara os dados atualizados
      const updatedPrinters = printers.filter(p =>
        p.width && p.inkTechnology
      )

      const hasMaterials = user ? loadUserActiveMaterials(user.email).length > 0 : false
      const shouldEnableReceiveOrders =
        !!user &&
        !user.dismissReceiveOrdersBanner &&
        updatedPrinters.length > 0 &&
        hasMaterials

      console.log('💾 Salvando dados:', {
        cpfCnpj,
        phone,
        printersCount: updatedPrinters.length,
        hasMaterials,
        shouldEnableReceiveOrders,
      })

      // Atualiza o usuário
      await updateUser({
        cpfCnpj: cpfCnpj.trim(),
        phone: phone.trim(),
        printers: updatedPrinters,
        receiveOrdersEnabled: shouldEnableReceiveOrders || user?.receiveOrdersEnabled,
      })

      console.log('✅ Onboarding salvo com sucesso! Redirecionando para /dashboard')

      // Aguarda um pouco antes de redirecionar para garantir que o estado seja atualizado
      await new Promise(resolve => setTimeout(resolve, 300))

      setIsSaving(false)

      // Redireciona para dashboard com fallback
      try {
        router.replace('/dashboard')
        // Fallback: se após 1 segundo ainda estiver na mesma página, força redirecionamento
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            console.log('⚠️ Router não funcionou, usando window.location como fallback')
            window.location.href = '/dashboard'
          }
        }, 1000)
      } catch (routerError) {
        console.error('❌ Erro no router, usando window.location:', routerError)
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar onboarding:', error)
      setSaveError('Erro ao salvar dados. Tente novamente.')
      setIsSaving(false)
    }
  }

  // Mostra loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <main className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando...</p>
          </div>
        </main>
      </div>
    )
  }

  // Se não houver usuário, não renderiza nada (já está redirecionando)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Container principal */}
        <div className="relative z-10 w-full max-w-2xl">
          <Card className="w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Cabeçalho */}
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Complete o cadastro da sua gráfica
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Precisamos de algumas informações para conectar você aos pedidos certos.
                </p>
              </div>

              {/* Erro geral */}
              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{saveError}</p>
                </div>
              )}

              {/* Sessão 1: Dados da empresa */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Dados da empresa
                </h2>
                <Input
                  label="CPF/CNPJ"
                  type="text"
                  placeholder="Digite o CPF ou CNPJ da empresa"
                  value={cpfCnpj}
                  onChange={(e) => {
                    setCpfCnpj(e.target.value)
                    if (errors.cpfCnpj) {
                      setErrors(prev => ({ ...prev, cpfCnpj: undefined }))
                    }
                  }}
                  error={errors.cpfCnpj}
                  required
                />
                <Input
                  label="Celular"
                  type="tel"
                  placeholder="Digite o celular"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: undefined }))
                    }
                  }}
                  error={errors.phone}
                  required
                />
              </div>

              {/* Sessão 2: Equipamentos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h2 className="text-lg font-semibold text-white">
                    Equipamentos (impressoras)
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Você pode completar impressoras e materiais depois no dashboard.
                </p>

                {/* Lista de impressoras */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {printers.map((printer, index) => (
                      <motion.div
                        key={printer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4 relative"
                      >
                        {/* Botão remover (só mostra se houver mais de uma) */}
                        {printers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrinter(printer.id)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Remover impressora"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}

                        <div className="pr-8">
                          <p className="text-xs text-slate-400 mb-3">
                            Impressora {index + 1}
                          </p>
                          
                          <div className="space-y-4">
                            <Input
                              label="Nome/modelo (opcional)"
                              type="text"
                              placeholder="Ex: Epson F6070"
                              value={printer.name}
                              onChange={(e) => handlePrinterChange(printer.id, 'name', e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Largura"
                                type="text"
                                placeholder="Ex: 1,60m ou 160cm"
                                value={printer.width}
                                onChange={(e) => handlePrinterChange(printer.id, 'width', e.target.value)}
                                required
                              />

                              <Select
                                label="Tecnologia da tinta"
                                placeholder="Selecione a tecnologia"
                                value={printer.inkTechnology}
                                onChange={(e) => handlePrinterChange(printer.id, 'inkTechnology', e.target.value)}
                                options={INK_TECHNOLOGY_OPTIONS}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Erro de validação das impressoras */}
                {errors.printers && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{errors.printers}</p>
                  </div>
                )}

                {/* Botão adicionar impressora */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPrinter}
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar impressora
                  </span>
                </Button>
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

