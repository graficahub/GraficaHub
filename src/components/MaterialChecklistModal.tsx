'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Package } from 'lucide-react'
import { MaterialCatalogItem } from '@/data/materialCatalog'
import { getCompatibleMaterials } from '@/utils/userMaterials'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface MaterialChecklistModalProps {
  isOpen: boolean
  technology: string
  onClose: () => void
  onConfirm: (selectedMaterialIds: string[]) => void
  existingMaterialIds?: string[] // Materiais já selecionados
}

export default function MaterialChecklistModal({
  isOpen,
  technology,
  onClose,
  onConfirm,
  existingMaterialIds = [],
}: MaterialChecklistModalProps) {
  const [materials, setMaterials] = useState<MaterialCatalogItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existingMaterialIds))

  useEffect(() => {
    if (isOpen && technology) {
      const compatible = getCompatibleMaterials(technology)
      setMaterials(compatible)
      // Inicializa com materiais já existentes
      setSelectedIds(new Set(existingMaterialIds))
    }
  }, [isOpen, technology, existingMaterialIds])

  const handleToggle = (materialId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(materialId)) {
        next.delete(materialId)
      } else {
        next.add(materialId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === materials.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(materials.map(m => m.id)))
    }
  }

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds))
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Materiais Compatíveis com {technology}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Selecione os materiais que sua gráfica trabalha com esta tecnologia
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-300">
              {materials.length} material{materials.length !== 1 ? 'is' : ''} encontrado{materials.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {selectedIds.size === materials.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {materials.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">
                  Nenhum material compatível encontrado para a tecnologia {technology}
                </p>
              </Card>
            ) : (
              materials.map((material) => {
                const isSelected = selectedIds.has(material.id)
                return (
                  <Card
                    key={material.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => handleToggle(material.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-400'
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">
                          {material.categoria} - {material.subcategoria} - {material.acabamento}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Tecnologias: {material.tecnologias.join(', ')}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
            >
              Confirmar Seleção ({selectedIds.size})
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}



