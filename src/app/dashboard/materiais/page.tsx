'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit, Trash2, Package } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  loadMaterialsFromStorage,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  Material,
} from '@/utils/materials'
import { loadPrintersFromStorage, Printer } from '@/utils/printers'
import {
  getCategorias,
  getSubcategorias,
  getAcabamentos,
  findCatalogItem,
  generateMaterialName,
} from '@/data/materialCatalog'
import { loadMaterialCatalog } from '@/utils/materialCatalogStorage'

const TECHNOLOGY_OPTIONS = [
  { value: 'UV', label: 'UV' },
  { value: 'Solvente', label: 'Solvente' },
  { value: 'Eco-solvente', label: 'Eco-solvente' },
  { value: 'Sublimação', label: 'Sublimação' },
  { value: 'DTF Têxtil', label: 'DTF Têxtil' },
  { value: 'DTF-UV', label: 'DTF-UV' },
  { value: 'Latex', label: 'Latex' },
]

export default function MateriaisPage() {
  const { user, logout } = useAuth()
  // router removido - autenticação é feita pelo layout server-side

  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Estados do formulário baseado em catálogo
  const [formData, setFormData] = useState({
    categoria: '',
    subcategoria: '',
    acabamento: '',
    precoPorM2: '',
    tecnologias: [] as string[],
    impressorasCompatíveis: [] as string[],
  })

  // Estados derivados
  const [availableSubcategorias, setAvailableSubcategorias] = useState<string[]>([])
  const [availableAcabamentos, setAvailableAcabamentos] = useState<string[]>([])
  const [suggestedTechnologies, setSuggestedTechnologies] = useState<string[]>([])
  const [generatedName, setGeneratedName] = useState('')

  // Carrega catálogo do storage (admin pode ter modificado) - usando useMemo para evitar recarregar
  const catalogData = useMemo(() => {
    if (typeof window === 'undefined') return []
    return loadMaterialCatalog()
  }, [])

  // Funções auxiliares usando o catálogo do storage
  const getSubcategoriasFromStorage = (categoria: string): string[] => {
    return Array.from(
      new Set(
        catalogData.filter((item) => item.categoria === categoria).map((item) => item.subcategoria)
      )
    ).sort()
  }

  const getAcabamentosFromStorage = (categoria: string, subcategoria: string): string[] => {
    return Array.from(
      new Set(
        catalogData
          .filter((item) => item.categoria === categoria && item.subcategoria === subcategoria)
          .map((item) => item.acabamento)
      )
    ).sort()
  }

  const findCatalogItemFromStorage = (
    categoria: string,
    subcategoria: string,
    acabamento: string
  ) => {
    return catalogData.find(
      (item) =>
        item.categoria === categoria &&
        item.subcategoria === subcategoria &&
        item.acabamento === acabamento
    )
  }

  const categorias = useMemo(() => {
    return Array.from(new Set(catalogData.map((item) => item.categoria))).sort()
  }, [catalogData])

  // Autenticação é feita pelo layout server-side
  // Removida verificação client-side para evitar redirects indevidos

  useEffect(() => {
    loadMaterials()
    loadPrinters()
  }, [])

  // Atualiza subcategorias quando categoria muda
  useEffect(() => {
    if (formData.categoria) {
      const subcats = getSubcategoriasFromStorage(formData.categoria)
      setAvailableSubcategorias(subcats)
      // Limpa subcategoria e acabamento quando categoria muda
      if (!subcats.includes(formData.subcategoria)) {
        setFormData((prev) => ({ ...prev, subcategoria: '', acabamento: '' }))
      }
    } else {
      setAvailableSubcategorias([])
    }
  }, [formData.categoria])

  // Atualiza acabamentos quando subcategoria muda
  useEffect(() => {
    if (formData.categoria && formData.subcategoria) {
      const acabamentos = getAcabamentosFromStorage(formData.categoria, formData.subcategoria)
      setAvailableAcabamentos(acabamentos)
      // Limpa acabamento quando subcategoria muda
      if (!acabamentos.includes(formData.acabamento)) {
        setFormData((prev) => ({ ...prev, acabamento: '' }))
      }
    } else {
      setAvailableAcabamentos([])
    }
  }, [formData.categoria, formData.subcategoria])

  // Atualiza tecnologias sugeridas e nome quando categoria + subcategoria + acabamento estão completos
  useEffect(() => {
    if (formData.categoria && formData.subcategoria && formData.acabamento) {
      const catalogItem = findCatalogItemFromStorage(
        formData.categoria,
        formData.subcategoria,
        formData.acabamento
      )
      
      if (catalogItem) {
        // Define tecnologias sugeridas do catálogo
        setSuggestedTechnologies(catalogItem.tecnologias)
        // Se não há tecnologias selecionadas, preenche com as sugeridas
        if (formData.tecnologias.length === 0) {
          setFormData((prev) => ({ ...prev, tecnologias: catalogItem.tecnologias }))
        }
      } else {
        setSuggestedTechnologies([])
      }

      // Gera nome automaticamente
      const name = generateMaterialName(formData.categoria, formData.subcategoria, formData.acabamento)
      setGeneratedName(name)
    } else {
      setSuggestedTechnologies([])
      setGeneratedName('')
    }
  }, [formData.categoria, formData.subcategoria, formData.acabamento])

  const loadMaterials = () => {
    const stored = loadMaterialsFromStorage()
    setMaterials(stored)
  }

  const loadPrinters = () => {
    const stored = loadPrintersFromStorage()
    setPrinters(stored)
  }

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material)
      setFormData({
        categoria: material.categoria || '',
        subcategoria: material.subcategoria || '',
        acabamento: material.acabamento || '',
        precoPorM2: material.precoPorM2?.toString() || material.pricePerM2?.toString() || '',
        tecnologias: material.tecnologias || [],
        impressorasCompatíveis: material.impressorasCompatíveis || material.compatiblePrinters || [],
      })
      setGeneratedName(material.nome || material.name || '')
    } else {
      setEditingMaterial(null)
      setFormData({
        categoria: '',
        subcategoria: '',
        acabamento: '',
        precoPorM2: '',
        tecnologias: [],
        impressorasCompatíveis: [],
      })
      setGeneratedName('')
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMaterial(null)
    setFormData({
      categoria: '',
      subcategoria: '',
      acabamento: '',
      precoPorM2: '',
      tecnologias: [],
      impressorasCompatíveis: [],
    })
    setGeneratedName('')
    setAvailableSubcategorias([])
    setAvailableAcabamentos([])
    setSuggestedTechnologies([])
  }

  const handleToggleTechnology = (technology: string) => {
    setFormData((prev) => ({
      ...prev,
      tecnologias: prev.tecnologias.includes(technology)
        ? prev.tecnologias.filter((t) => t !== technology)
        : [...prev.tecnologias, technology],
    }))
  }

  const handleTogglePrinter = (printerId: string) => {
    setFormData((prev) => ({
      ...prev,
      impressorasCompatíveis: prev.impressorasCompatíveis.includes(printerId)
        ? prev.impressorasCompatíveis.filter((id) => id !== printerId)
        : [...prev.impressorasCompatíveis, printerId],
    }))
  }

  const handleSave = () => {
    // Validação
    if (!formData.categoria || !formData.subcategoria || !formData.acabamento) {
      alert('Por favor, selecione Categoria, Subcategoria e Acabamento')
      return
    }

    if (!formData.precoPorM2) {
      alert('Por favor, informe o preço por m²')
      return
    }

    const price = parseFloat(formData.precoPorM2.replace(',', '.'))
    if (isNaN(price) || price <= 0) {
      alert('Preço inválido. Informe um valor maior que zero.')
      return
    }

    // Encontra o item do catálogo
    const catalogItem = findCatalogItem(formData.categoria, formData.subcategoria, formData.acabamento)
    if (!catalogItem) {
      alert('Item do catálogo não encontrado. Por favor, selecione novamente.')
      return
    }

    const materialData = {
      idCatalogo: catalogItem.id,
      nome: generatedName,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      acabamento: formData.acabamento,
      precoPorM2: price,
      tecnologias: formData.tecnologias,
      impressorasCompatíveis: formData.impressorasCompatíveis,
    }

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData)
    } else {
      createMaterial(materialData)
    }

    loadMaterials()
    handleCloseModal()
  }

  const handleDelete = (materialId: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterial(materialId)
      loadMaterials()
    }
  }

  const getCompatiblePrintersNames = (material: Material): string => {
    const printerIds = material.impressorasCompatíveis || material.compatiblePrinters || []
    if (printerIds.length === 0) return 'Nenhuma'
    const names = printerIds
      .map((id) => printers.find((p) => p.id === id)?.name)
      .filter(Boolean)
    return names.length > 0 ? names.join(', ') : 'Nenhuma'
  }

  const getTechnologiesDisplay = (material: Material): string => {
    const techs = material.tecnologias || []
    return techs.length > 0 ? techs.join(', ') : 'Nenhuma'
  }

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar isLoading ou !user

  return (
    <div className="min-h-screen w-full bg-gray-50">

      <Sidebar
        userEmail={user?.email || ''}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Materiais"
          subtitle="Gerencie seus materiais"
          userEmail={user?.email || ''}
          onLogout={logout}
        />

        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Seus Materiais</h2>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Material
            </Button>
          </div>

          {materials.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Nenhum material cadastrado</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Adicionar primeiro material
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {material.nome || material.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Preço:</span>
                        <span className="text-sm text-white font-medium">
                          R$ {(material.precoPorM2 || material.pricePerM2 || 0).toFixed(2)}/m²
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Categoria:</span>
                        <span className="text-sm text-white">{material.categoria || material.category}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-slate-400">Tecnologias:</span>
                        <span className="text-xs text-slate-300 text-right max-w-[60%]">
                          {getTechnologiesDisplay(material)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-xs text-slate-400 block mb-1">Impressoras compatíveis:</span>
                        <span className="text-xs text-slate-300">
                          {getCompatiblePrintersNames(material)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleOpenModal(material)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
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

      {/* Modal: Adicionar/Editar Material */}
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
                  {editingMaterial ? 'Editar Material' : 'Adicionar Material'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Categoria */}
                <Select
                  label="Categoria"
                  placeholder="Selecione a categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value, subcategoria: '', acabamento: '' })}
                  options={categorias.map((cat) => ({ value: cat, label: cat }))}
                />

                {/* 2. Subcategoria */}
                <Select
                  label="Subcategoria / Tipo"
                  placeholder={
                    formData.categoria
                      ? 'Selecione a subcategoria'
                      : 'Selecione primeiro a categoria'
                  }
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value, acabamento: '' })}
                  options={availableSubcategorias.map((sub) => ({ value: sub, label: sub }))}
                  disabled={!formData.categoria}
                />

                {/* 3. Acabamento */}
                <Select
                  label="Acabamento"
                  placeholder={
                    formData.subcategoria
                      ? 'Selecione o acabamento'
                      : 'Selecione primeiro a subcategoria'
                  }
                  value={formData.acabamento}
                  onChange={(e) => setFormData({ ...formData, acabamento: e.target.value })}
                  options={availableAcabamentos.map((acab) => ({ value: acab, label: acab }))}
                  disabled={!formData.subcategoria}
                />

                {/* 4. Nome do material (somente leitura) */}
                <Input
                  label="Nome do material"
                  type="text"
                  value={generatedName}
                  disabled
                  className="bg-white/5 text-slate-400 cursor-not-allowed"
                />

                {/* 5. Tecnologias compatíveis */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tecnologias compatíveis
                    {suggestedTechnologies.length > 0 && (
                      <span className="text-xs text-slate-400 ml-2">
                        (Sugeridas: {suggestedTechnologies.join(', ')})
                      </span>
                    )}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                    {TECHNOLOGY_OPTIONS.map((tech) => (
                      <label
                        key={tech.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tecnologias.includes(tech.value)}
                          onChange={() => handleToggleTechnology(tech.value)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-white">{tech.label}</span>
                        {suggestedTechnologies.includes(tech.value) && (
                          <span className="text-xs text-blue-400 ml-auto">Sugerida</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 6. Preço por m² */}
                <Input
                  label="Preço por m²"
                  type="text"
                  placeholder="Ex: 25,50"
                  value={formData.precoPorM2}
                  onChange={(e) => setFormData({ ...formData, precoPorM2: e.target.value })}
                />

                {/* 7. Impressoras compatíveis */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Impressoras compatíveis
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                    {printers.length === 0 ? (
                      <p className="text-sm text-slate-400">Nenhuma impressora cadastrada</p>
                    ) : (
                      printers.map((printer) => (
                        <label
                          key={printer.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.impressorasCompatíveis.includes(printer.id)}
                            onChange={() => handleTogglePrinter(printer.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">
                            {printer.name} ({printer.technology})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" fullWidth onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                  disabled={
                    !formData.categoria ||
                    !formData.subcategoria ||
                    !formData.acabamento ||
                    !formData.precoPorM2 ||
                    formData.tecnologias.length === 0
                  }
                >
                  {editingMaterial ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
