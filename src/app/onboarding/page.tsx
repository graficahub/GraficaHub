'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle, Building2, Printer, Package, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const WIDTH_OPTIONS = [
  { value: '0.60', label: '0,60m' },
  { value: '1.00', label: '1,00m' },
  { value: '1.20', label: '1,20m' },
  { value: '1.60', label: '1,60m' },
  { value: '1.80', label: '1,80m' },
  { value: '2.00', label: '2,00m' },
  { value: '2.50', label: '2,50m' },
  { value: '3.20', label: '3,20m' },
  { value: '5.00', label: '5,00m' },
]

const TECHNOLOGY_OPTIONS = [
  { value: 'UV', label: 'UV' },
  { value: 'Eco-solvente', label: 'Eco-solvente' },
  { value: 'Solvente', label: 'Solvente' },
  { value: 'Sublimação', label: 'Sublimação' },
  { value: 'DTF', label: 'DTF' },
  { value: 'DTF-UV', label: 'DTF-UV' },
]

interface Printer {
  id: string
  name?: string
  tamanho: string
  tecnologia: string
}

interface Material {
  id: string
  categoria: string
  subcategoria: string
  acabamento: string
  tecnologias: string[]
  preco?: number
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Passo 1: Dados da Gráfica
  const [companyName, setCompanyName] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Passo 2: Impressoras
  const [printers, setPrinters] = useState<Printer[]>([])

  // Passo 3: Materiais
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || '')
      setCpfCnpj(user.cpfCnpj || '')
      setPhone(user.phone || '')
      setEmail(user.email || '')
      if (user.address) {
        setStreet(user.address.street || '')
        setNumber(user.address.number || '')
        setComplement(user.address.complement || '')
        setNeighborhood(user.address.neighborhood || '')
        setCity(user.address.city || '')
        setState(user.address.state || '')
        setZipCode(user.address.zipCode || '')
      }
      if (user.printers) {
        setPrinters(user.printers.map(p => ({
          id: p.id,
          name: p.name,
          tamanho: p.width.replace('m', '').replace(',', '.'),
          tecnologia: p.inkTechnology
        })))
      }
    }
    setIsLoading(false)
  }, [user])

  const validateStep1 = () => {
    return (
      companyName.trim() !== '' &&
      cpfCnpj.trim() !== '' &&
      street.trim() !== '' &&
      number.trim() !== '' &&
      neighborhood.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      zipCode.trim() !== '' &&
      phone.trim() !== '' &&
      email.trim() !== ''
    )
  }

  const validateStep2 = () => {
    return printers.length > 0 && printers.every(p => p.tamanho && p.tecnologia)
  }

  const handleAddPrinter = () => {
    setPrinters([...printers, {
      id: `PRINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tamanho: '',
      tecnologia: ''
    }])
  }

  const handleRemovePrinter = (id: string) => {
    setPrinters(printers.filter(p => p.id !== id))
  }

  const handleUpdatePrinter = (id: string, field: keyof Printer, value: string) => {
    setPrinters(printers.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        alert('Preencha todos os campos obrigatórios')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        alert('Adicione pelo menos uma impressora')
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      await handleFinish()
    }
  }

  const handleFinish = async () => {
    try {
      // Salva dados do passo 1
      await updateUser({
        companyName,
        cpfCnpj,
        phone,
        address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zipCode
        },
        printers: printers.map(p => ({
          id: p.id,
          name: p.name || '',
          width: `${p.tamanho}m`,
          inkTechnology: p.tecnologia
        }))
      })

      // Salva materiais em localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('GH_USER_MATERIALS', JSON.stringify(materials))
        localStorage.setItem('GH_ONBOARDING_COMPLETE', 'true')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error)
      alert('Erro ao salvar dados. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Indicador de progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              {currentStep === 1 && 'Dados da Gráfica'}
              {currentStep === 2 && 'Cadastro de Impressoras'}
              {currentStep === 3 && 'Cadastro de Materiais'}
            </h2>
            <p className="text-sm text-slate-400">
              Passo {currentStep} de 3
            </p>
          </div>
        </div>

        <Card className="p-8">
          <AnimatePresence mode="wait">
            {/* Passo 1: Dados da Gráfica */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Dados da Gráfica</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Gráfica *"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <Input
                    label="CPF/CNPJ *"
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                  />
                  <Input
                    label="Email Comercial *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="WhatsApp *"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Endereço Completo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Logradouro *"
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>
                    <Input
                      label="Número *"
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Complemento"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Bairro *"
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                    <Input
                      label="Cidade *"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Estado *"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="SP"
                    />
                    <Input
                      label="CEP *"
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Passo 2: Impressoras */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Printer className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Cadastro de Impressoras</h3>
                </div>

                <p className="text-slate-400 mb-6">
                  Adicione pelo menos uma impressora. Você pode adicionar quantas precisar.
                </p>

                <div className="space-y-4">
                  {printers.map((printer, index) => (
                    <Card key={printer.id} className="p-4 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Impressora {index + 1}</h4>
                        {printers.length > 1 && (
                          <button
                            onClick={() => handleRemovePrinter(printer.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Nome (opcional)"
                          type="text"
                          value={printer.name || ''}
                          onChange={(e) => handleUpdatePrinter(printer.id, 'name', e.target.value)}
                          placeholder="Ex: Impressora UV Principal"
                        />
                        <Select
                          label="Tamanho Útil *"
                          value={printer.tamanho}
                          onChange={(e) => handleUpdatePrinter(printer.id, 'tamanho', e.target.value)}
                          options={WIDTH_OPTIONS}
                        />
                        <Select
                          label="Tecnologia *"
                          value={printer.tecnologia}
                          onChange={(e) => handleUpdatePrinter(printer.id, 'tecnologia', e.target.value)}
                          options={TECHNOLOGY_OPTIONS}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={handleAddPrinter}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Impressora
                </Button>
              </motion.div>
            )}

            {/* Passo 3: Materiais */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Cadastro de Materiais</h3>
                </div>

                <p className="text-slate-400 mb-6">
                  Selecione os materiais que sua gráfica trabalha. Você pode adicionar mais depois.
                </p>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 <strong>Dica:</strong> Você pode pular esta etapa e cadastrar materiais depois no dashboard.
                  </p>
                </div>

                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">
                    O cadastro de materiais será implementado na próxima etapa.
                    Por enquanto, você pode finalizar o onboarding.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões de navegação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === 3 ? 'Finalizar' : 'Próximo'}
              {currentStep < 3 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

