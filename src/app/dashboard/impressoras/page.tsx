'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit, Trash2, Printer } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  loadPrintersFromStorage,
  savePrintersToStorage,
  createPrinter,
  updatePrinter,
  deletePrinter,
  Printer as PrinterType,
} from '@/utils/printers'
import MaterialChecklistModal from '@/components/MaterialChecklistModal'
import { addUserActiveMaterials, loadUserActiveMaterials } from '@/utils/userMaterials'

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

const TECHNOLOGY_OPTIONS = [
  { value: 'UV', label: 'UV' },
  { value: 'Solvente/EcoSolvente', label: 'Solvente/EcoSolvente' },
  { value: 'Sublimação', label: 'Sublimação' },
  { value: 'DTF Têxtil', label: 'DTF Têxtil' },
  { value: 'DTF-UV', label: 'DTF-UV' },
]

export default function ImpressorasPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const [printers, setPrinters] = useState<PrinterType[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [checklistTechnology, setChecklistTechnology] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    technology: '' as PrinterType['technology'] | '',
    width: '',
    brand: '',
    model: '',
    averageSpeed: '',
  })

  // Autenticação é feita pelo layout server-side
  // Removida verificação client-side para evitar redirects indevidos

  useEffect(() => {
    loadPrinters()
  }, [])

  const loadPrinters = () => {
    const stored = loadPrintersFromStorage()
    setPrinters(stored)
  }

  const handleOpenModal = (printer?: PrinterType) => {
    if (printer) {
      setEditingPrinter(printer)
      setFormData({
        name: printer.name,
        technology: printer.technology,
        width: printer.width,
        brand: printer.brand || '',
        model: printer.model || '',
        averageSpeed: printer.averageSpeed || '',
      })
    } else {
      setEditingPrinter(null)
      setFormData({
        name: '',
        technology: '' as PrinterType['technology'] | '',
        width: '',
        brand: '',
        model: '',
        averageSpeed: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPrinter(null)
    setFormData({
      name: '',
      technology: '' as PrinterType['technology'] | '',
      width: '',
      brand: '',
      model: '',
      averageSpeed: '',
    })
  }

  const handleSave = () => {
    if (!formData.name || !formData.technology || !formData.width) {
      alert('Preencha pelo menos nome, tecnologia e largura')
      return
    }

    if (editingPrinter) {
      updatePrinter(editingPrinter.id, {
        name: formData.name,
        technology: formData.technology as PrinterType['technology'],
        width: formData.width,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        averageSpeed: formData.averageSpeed || undefined,
      })
      loadPrinters()
      handleCloseModal()
    } else {
      // Nova impressora - salva e abre checklist
      createPrinter({
        name: formData.name,
        technology: formData.technology as PrinterType['technology'],
        width: formData.width,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        averageSpeed: formData.averageSpeed || undefined,
      })
      loadPrinters()
      handleCloseModal()
      
      // Abre checklist de materiais compatíveis
      if (user) {
        const existingMaterials = loadUserActiveMaterials(user.email)
        setChecklistTechnology(formData.technology)
        setShowChecklist(true)
      }
    }
  }

  const handleChecklistConfirm = (selectedMaterialIds: string[]) => {
    if (user && selectedMaterialIds.length > 0) {
      addUserActiveMaterials(user.email, selectedMaterialIds)
    }
    setShowChecklist(false)
  }

  const handleDelete = (printerId: string) => {
    if (confirm('Tem certeza que deseja excluir esta impressora?')) {
      deletePrinter(printerId)
      loadPrinters()
    }
  }

  const getTechnologyColor = (technology: PrinterType['technology']) => {
    const colors: Record<PrinterType['technology'], string> = {
      UV: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Solvente/EcoSolvente': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Sublimação': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'DTF Têxtil': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'DTF-UV': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    }
    return colors[technology] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar isLoading ou !user

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <Sidebar
        userEmail={user?.email || ''}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        hasPendingOrdersBadge={false}
      />

      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Impressoras"
          subtitle="Gerencie suas impressoras"
          userEmail={user?.email || ''}
          onLogout={logout}
        />

        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Suas Impressoras</h2>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Impressora
            </Button>
          </div>

          {printers.length === 0 ? (
            <Card className="p-12 text-center">
              <Printer className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Nenhuma impressora cadastrada</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Adicionar primeira impressora
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {printers.map((printer) => (
                <Card key={printer.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{printer.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Tecnologia:</span>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getTechnologyColor(printer.technology)}`}
                          >
                            {printer.technology}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Largura útil:</span>
                          <span className="text-sm text-white font-medium">{printer.width}</span>
                        </div>
                        {printer.brand && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Marca:</span>
                            <span className="text-sm text-white">{printer.brand}</span>
                          </div>
                        )}
                        {printer.model && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Modelo:</span>
                            <span className="text-sm text-white">{printer.model}</span>
                          </div>
                        )}
                        {printer.averageSpeed && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Velocidade:</span>
                            <span className="text-sm text-white">{printer.averageSpeed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleOpenModal(printer)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(printer.id)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Adicionar/Editar Impressora */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingPrinter ? 'Editar Impressora' : 'Adicionar Impressora'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome da impressora"
                  type="text"
                  placeholder="Ex: Epson F6070"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Select
                  label="Tecnologia"
                  placeholder="Selecione a tecnologia"
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value as PrinterType['technology'] })}
                  options={TECHNOLOGY_OPTIONS}
                />

                <Select
                  label="Largura útil"
                  placeholder="Selecione a largura"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  options={WIDTH_OPTIONS}
                />

                <Input
                  label="Marca e modelo (opcional)"
                  type="text"
                  placeholder="Ex: Epson F6070"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />

                <Input
                  label="Velocidade média (opcional)"
                  type="text"
                  placeholder="Ex: 20 m²/h"
                  value={formData.averageSpeed}
                  onChange={(e) => setFormData({ ...formData, averageSpeed: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" fullWidth onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                  disabled={!formData.name || !formData.technology || !formData.width}
                >
                  {editingPrinter ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Checklist de Materiais */}
        <MaterialChecklistModal
          isOpen={showChecklist}
          technology={checklistTechnology}
          onClose={() => setShowChecklist(false)}
          onConfirm={handleChecklistConfirm}
          existingMaterialIds={user ? loadUserActiveMaterials(user.email).map(m => m.materialId) : []}
        />
      </AnimatePresence>
    </div>
  )
}

