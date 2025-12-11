'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { loadMaterialCatalog } from '@/utils/materialCatalogStorage'
import { createOrder } from '@/utils/ordersMVP'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'

export default function CriarPedidoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [materials, setMaterials] = useState<any[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Verifica se tem impressoras cadastradas
    if (!user.printers || user.printers.length === 0) {
      setError('Você precisa cadastrar pelo menos uma impressora antes de criar pedidos.')
    }

    // Carrega catálogo de materiais
    const catalog = loadMaterialCatalog()
    setMaterials(catalog)
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedMaterial || !quantidade) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    const qty = parseInt(quantidade)
    if (isNaN(qty) || qty <= 0) {
      setError('Quantidade inválida')
      return
    }

    if (!user) return

    setIsSubmitting(true)

    try {
      createOrder(user.email, selectedMaterial, qty, observacoes || undefined)
      
      // Sucesso
      router.push('/dashboard/pedidos')
    } catch (err) {
      console.error('Erro ao criar pedido:', err)
      setError('Erro ao criar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMaterialData = materials.find(m => m.id === selectedMaterial)

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard title="Criar Pedido" />

        <div className="p-4 md:p-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Criar Novo Pedido</h1>
          </div>

          {error && (
            <Card className="p-4 mb-6 bg-red-500/10 border-red-500/20">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </Card>
          )}

          {(!user.printers || user.printers.length === 0) ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Cadastre Impressoras Primeiro
              </h2>
              <p className="text-slate-400 mb-6">
                Você precisa cadastrar pelo menos uma impressora antes de criar pedidos.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/impressoras')}
              >
                Ir para Impressoras
              </Button>
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Material *
                  </label>
                  <Select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    options={[
                      { value: '', label: 'Selecione um material' },
                      ...materials.map(m => ({
                        value: m.id,
                        label: `${m.categoria} - ${m.subcategoria} - ${m.acabamento}`
                      }))
                    ]}
                  />
                  {selectedMaterialData && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">
                          {selectedMaterialData.categoria} - {selectedMaterialData.subcategoria} - {selectedMaterialData.acabamento}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Tecnologias: {selectedMaterialData.tecnologias.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label="Quantidade *"
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  min="1"
                  placeholder="Ex: 10"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Informações adicionais sobre o pedido..."
                  />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 <strong>Nota:</strong> O upload de arquivo será implementado em breve.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isSubmitting || !selectedMaterial || !quantidade}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Pedido'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}



