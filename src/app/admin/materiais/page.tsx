'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit, Trash2, Package } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  loadMaterialCatalog,
  saveMaterialCatalog,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  loadTechnologies,
  addTechnology,
} from '@/utils/materialCatalogStorage'
import { MaterialCatalogItem } from '@/data/materialCatalog'
// markAsDirty já é chamado automaticamente nas funções de storage

export default function AdminMateriaisPage() {
  const [catalog, setCatalog] = useState<MaterialCatalogItem[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MaterialCatalogItem | null>(null)
  const [newTechnology, setNewTechnology] = useState('')

  const [formData, setFormData] = useState({
    categoria: '',
    subcategoria: '',
    acabamento: '',
    tecnologias: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const catalogData = loadMaterialCatalog()
    const techData = loadTechnologies()
    setCatalog(catalogData)
    setTechnologies(techData)
  }

  const handleOpenModal = (item?: MaterialCatalogItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        acabamento: item.acabamento,
        tecnologias: item.tecnologias,
      })
    } else {
      setEditingItem(null)
      setFormData({
        categoria: '',
        subcategoria: '',
        acabamento: '',
        tecnologias: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({
      categoria: '',
      subcategoria: '',
      acabamento: '',
      tecnologias: [],
    })
    setNewTechnology('')
  }

  const handleToggleTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      tecnologias: prev.tecnologias.includes(tech)
        ? prev.tecnologias.filter((t) => t !== tech)
        : [...prev.tecnologias, tech],
    }))
  }

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      addTechnology(newTechnology.trim())
      setTechnologies([...technologies, newTechnology.trim()])
      setNewTechnology('')
    }
  }

  const handleSave = () => {
    if (!formData.categoria || !formData.subcategoria || !formData.acabamento) {
      alert('Preencha categoria, subcategoria e acabamento')
      return
    }

    if (formData.tecnologias.length === 0) {
      alert('Selecione pelo menos uma tecnologia')
      return
    }

    if (editingItem) {
      updateCatalogItem(editingItem.id, formData)
    } else {
      addCatalogItem(formData)
    }

    loadData()
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
      deleteCatalogItem(id)
      loadData()
    }
  }

  // Obtém categorias únicas
  const categorias = Array.from(new Set(catalog.map((item) => item.categoria))).sort()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Catálogo de Materiais</h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Gerencie o catálogo de materiais disponível para os usuários
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Material
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">{catalog.length}</div>
            <div className="text-sm text-slate-400">Itens no catálogo</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">{categorias.length}</div>
            <div className="text-sm text-slate-400">Categorias</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">{technologies.length}</div>
            <div className="text-sm text-slate-400">Tecnologias disponíveis</div>
          </Card>
        </div>

        {/* Tabela de Catálogo */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Categoria</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Subcategoria</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Acabamento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tecnologias</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {catalog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nenhum item no catálogo. Adicione o primeiro item.
                    </td>
                  </tr>
                ) : (
                  catalog.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                      } hover:bg-white/10`}
                    >
                      <td className="py-3 px-4 text-sm text-white">{item.categoria}</td>
                      <td className="py-3 px-4 text-sm text-white">{item.subcategoria}</td>
                      <td className="py-3 px-4 text-sm text-white">{item.acabamento}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {item.tecnologias.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal: Adicionar/Editar Item */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingItem ? 'Editar Item do Catálogo' : 'Adicionar Item ao Catálogo'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoria
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-slate-800 text-white">
                        Selecione ou digite nova
                      </option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-800 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="text"
                      placeholder="Nova categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Input
                  label="Subcategoria / Tipo"
                  type="text"
                  placeholder="Ex: Frontlight 440g"
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                />

                <Input
                  label="Acabamento"
                  type="text"
                  placeholder="Ex: Brilho, Fosco, Translúcido"
                  value={formData.acabamento}
                  onChange={(e) => setFormData({ ...formData, acabamento: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tecnologias compatíveis
                  </label>
                  
                  {/* Adicionar nova tecnologia */}
                  <div className="mb-3 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Adicionar nova tecnologia"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTechnology}
                      disabled={!newTechnology.trim()}
                    >
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de tecnologias */}
                  <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                    {technologies.map((tech) => (
                      <label
                        key={tech}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tecnologias.includes(tech)}
                          onChange={() => handleToggleTechnology(tech)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-white">{tech}</span>
                      </label>
                    ))}
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
                    formData.tecnologias.length === 0
                  }
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
