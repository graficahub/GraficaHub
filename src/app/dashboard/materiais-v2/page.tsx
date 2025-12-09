'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Plus, X, Edit, Trash2, Package, DollarSign } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  getUserActiveMaterialsWithDetails,
  removeUserActiveMaterial,
  updateMaterialDefaultPrice,
  addUserActiveMaterials,
  loadUserActiveMaterials,
} from '@/utils/userMaterials'
import MaterialChecklistModal from '@/components/MaterialChecklistModal'

export default function MateriaisV2Page() {
  const { user } = useAuth()
  const router = useRouter()
  const [materials, setMaterials] = useState<Array<{
    material: any
    precoPadrao: number | null
  }>>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/auth')
      return
    }
    loadMaterials()
  }, [user, router])

  const loadMaterials = () => {
    if (!user) return
    const activeMaterials = getUserActiveMaterialsWithDetails(user.email)
    setMaterials(activeMaterials)
  }

  const handleRemove = (materialId: string) => {
    if (!user) return
    if (confirm('Tem certeza que deseja remover este material?')) {
      removeUserActiveMaterial(user.email, materialId)
      loadMaterials()
    }
  }

  const handleEditPrice = (materialId: string, currentPrice: number | null) => {
    setEditingPriceId(materialId)
    setPriceValue(currentPrice ? currentPrice.toString() : '')
  }

  const handleSavePrice = () => {
    if (!user || !editingPriceId) return
    
    const price = priceValue ? parseFloat(priceValue.replace(',', '.')) : null
    if (price !== null && (isNaN(price) || price < 0)) {
      alert('Preço inválido')
      return
    }

    updateMaterialDefaultPrice(user.email, editingPriceId, price)
    setEditingPriceId(null)
    setPriceValue('')
    loadMaterials()
  }

  const handleAddMaterials = (selectedIds: string[]) => {
    if (!user) return
    addUserActiveMaterials(user.email, selectedIds)
    loadMaterials()
    setShowAddModal(false)
  }

  // Obtém todas as tecnologias das impressoras do usuário
  const getUserTechnologies = (): string[] => {
    if (!user?.printers) return []
    const techs = new Set<string>()
    user.printers.forEach(printer => {
      // Normaliza tecnologia
      const tech = printer.inkTechnology
      if (tech === 'Solvente/EcoSolvente') {
        techs.add('Solvente')
        techs.add('Eco-solvente')
      } else {
        techs.add(tech)
      }
    })
    return Array.from(techs)
  }

  if (!user) return null

  const userTechs = getUserTechnologies()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Sidebar
        userEmail={user.email}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        hasPendingOrdersBadge={false}
      />
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Materiais"
          subtitle="Gerencie seus materiais e preços padrão"
          userEmail={user.email}
        />

        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Materiais Ativos</h2>
              <p className="text-sm text-slate-400 mt-1">
                Materiais que sua gráfica trabalha com base nas suas impressoras
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
              disabled={userTechs.length === 0}
            >
              <Plus className="w-4 h-4" />
              Adicionar Materiais
            </Button>
          </div>

          {userTechs.length === 0 && (
            <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
              <p className="text-yellow-400">
                Você precisa cadastrar pelo menos uma impressora para adicionar materiais.
              </p>
            </Card>
          )}

          {materials.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum material cadastrado
              </h3>
              <p className="text-slate-400 mb-6">
                Adicione materiais compatíveis com suas impressoras
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                disabled={userTechs.length === 0}
              >
                Adicionar Materiais
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(({ material, precoPadrao }) => (
                <Card key={material.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">
                        {material.categoria}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {material.subcategoria} - {material.acabamento}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(material.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-2">Tecnologias:</p>
                    <div className="flex flex-wrap gap-1">
                      {material.tecnologias.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {editingPriceId === material.id ? (
                    <div className="space-y-2">
                      <Input
                        label="Preço por m² (R$)"
                        type="text"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        placeholder="0,00"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => {
                            setEditingPriceId(null)
                            setPriceValue('')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={handleSavePrice}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Preço padrão:</span>
                        <button
                          onClick={() => handleEditPrice(material.id, precoPadrao)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {precoPadrao !== null ? (
                          <>R$ {precoPadrao.toFixed(2)}/m²</>
                        ) : (
                          <span className="text-slate-500">Não definido</span>
                        )}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal para adicionar materiais */}
        {userTechs.length > 0 && (
          <MaterialChecklistModal
            isOpen={showAddModal}
            technology={userTechs[0]} // Usa a primeira tecnologia, pode melhorar depois
            onClose={() => setShowAddModal(false)}
            onConfirm={handleAddMaterials}
            existingMaterialIds={loadUserActiveMaterials(user.email).map(m => m.materialId)}
          />
        )}
      </main>
    </div>
  )
}

