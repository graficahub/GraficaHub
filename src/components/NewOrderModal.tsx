'use client'

import { useState, FormEvent, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NewOrderFormData } from '@/types/orders'
import { criarPedido } from '@/utils/orders'
import { 
  Tecnologia,
  getAllTecnologias,
  getMateriaisByTecnologia,
  getMaterialByTecnologia,
  getTecnologiaLabel
} from '@/config/tecnologiasMateriais'
import { generateOrderName } from '@/utils/orderNameGenerator'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderId: string) => void
  userId?: string
}

export default function NewOrderModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: NewOrderModalProps) {
  const [formData, setFormData] = useState<NewOrderFormData>({
    service: '',
    tecnologia: 'SOLVENTE_ECOSOLVENTE', // Valor padrão
    materialId: '',
    caracteristicaId: '',
    width: '',
    height: '',
    quantity: 1,
    deadline: '',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoGenerateName, setAutoGenerateName] = useState(true)

  // Opções de tecnologia
  const tecnologiaOptions = getAllTecnologias().map(t => ({
    value: t.tecnologia,
    label: getTecnologiaLabel(t.tecnologia),
  }))

  // Materiais disponíveis para a tecnologia selecionada
  const availableMaterials = useMemo(() => {
    if (!formData.tecnologia) return []
    return getMateriaisByTecnologia(formData.tecnologia)
  }, [formData.tecnologia])

  // Material selecionado
  const selectedMaterial = useMemo(() => {
    if (!formData.tecnologia || !formData.materialId) return null
    return getMaterialByTecnologia(formData.tecnologia, formData.materialId)
  }, [formData.tecnologia, formData.materialId])

  // Características disponíveis para o material selecionado
  const availableCaracteristicas = useMemo(() => {
    return selectedMaterial?.caracteristicas || []
  }, [selectedMaterial])

  // Gera o nome automaticamente quando os campos relevantes mudam
  useEffect(() => {
    if (!autoGenerateName) return

    if (formData.tecnologia && formData.materialId) {
      const generatedName = generateOrderName({
        tecnologia: formData.tecnologia,
        materialId: formData.materialId,
        caracteristicaId: formData.caracteristicaId || undefined,
        width: formData.width || undefined,
        height: formData.height || undefined,
        quantity: formData.quantity,
      })

      setFormData(prev => ({ ...prev, service: generatedName }))
    }
  }, [
    formData.tecnologia,
    formData.materialId,
    formData.caracteristicaId,
    formData.width,
    formData.height,
    formData.quantity,
    autoGenerateName,
  ])

  // Limpa o formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        service: '',
        tecnologia: 'SOLVENTE_ECOSOLVENTE',
        materialId: '',
        caracteristicaId: '',
        width: '',
        height: '',
        quantity: 1,
        deadline: '',
        description: '',
      })
      setErrors({})
      setAutoGenerateName(true)
    }
  }, [isOpen])

  // Limpa material e característica quando tecnologia muda
  useEffect(() => {
    setFormData(prev => ({ ...prev, materialId: '', caracteristicaId: '' }))
  }, [formData.tecnologia])

  // Limpa característica quando material muda
  useEffect(() => {
    setFormData(prev => ({ ...prev, caracteristicaId: '' }))
  }, [formData.materialId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.tecnologia) {
      newErrors.tecnologia = 'Tecnologia é obrigatória'
    }

    if (!formData.service.trim()) {
      newErrors.service = 'Título do serviço é obrigatório'
    }

    if (!formData.materialId) {
      newErrors.materialId = 'Material é obrigatório'
    }

    if (!formData.width.trim()) {
      newErrors.width = 'Largura é obrigatória'
    }

    if (!formData.height.trim()) {
      newErrors.height = 'Altura é obrigatória'
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantidade deve ser maior que zero'
    }

    if (!formData.deadline.trim()) {
      newErrors.deadline = 'Prazo desejado é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Busca informações do material e característica
      const material = selectedMaterial
      const materialName = material?.label
      const caracteristicaName = formData.caracteristicaId
        ? availableCaracteristicas.find(c => c.id === formData.caracteristicaId)?.label
        : undefined

      // Determina a categoria baseada no material (para compatibilidade)
      const category = material?.categoria || 'OUTRO'

      // Cria o pedido (usando campos novos e mantendo compatibilidade)
      const orderData: NewOrderFormData = {
        ...formData,
        category: category as any, // Compatibilidade com tipo antigo
      }

      const newOrder = criarPedido(
        orderData,
        userId,
        materialName,
        caracteristicaName
      )

      // Chama o callback de sucesso
      onSuccess(newOrder.id)

      // Fecha o modal
      onClose()
    } catch (error) {
      // Log de erro ao criar pedido
      if (typeof window !== 'undefined') {
        const { logEvent } = require('@/utils/logService')
        logEvent('error', 'Erro ao criar pedido', {
          userId,
          context: 'PEDIDO',
          details: {
            error: error instanceof Error ? error.message : String(error),
            formData,
          },
        })
      }
      console.error('❌ Erro ao criar pedido:', error)
      setErrors({ submit: 'Erro ao criar pedido. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Opções de materiais formatadas para o select
  const materialOptions = availableMaterials.map(m => ({
    value: m.id,
    label: m.descricaoCurta 
      ? `${m.label} (${m.descricaoCurta})`
      : m.label,
  }))

  // Opções de características formatadas para o select
  const caracteristicaOptions = availableCaracteristicas.map(c => ({
    value: c.id,
    label: c.label,
  }))

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Novo Pedido</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erro geral */}
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* PASSO 1: Tecnologia */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tecnologia <span className="text-red-400">*</span>
                </label>
                <Select
                  placeholder="Selecione a tecnologia"
                  value={formData.tecnologia}
                  onChange={(e) => {
                    setFormData({ ...formData, tecnologia: e.target.value as Tecnologia })
                    if (errors.tecnologia) setErrors({ ...errors, tecnologia: '' })
                  }}
                  options={tecnologiaOptions}
                  error={errors.tecnologia}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  A tecnologia escolhida determinará os materiais disponíveis.
                </p>
              </div>

              {/* PASSO 2: Material */}
              {availableMaterials.length === 0 && formData.tecnologia ? (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Não há materiais cadastrados para esta tecnologia ainda.
                  </p>
                </div>
              ) : (
                <Select
                  label="Material"
                  placeholder={
                    formData.tecnologia 
                      ? 'Selecione o material' 
                      : 'Selecione primeiro a tecnologia'
                  }
                  value={formData.materialId}
                  onChange={(e) => {
                    setFormData({ ...formData, materialId: e.target.value })
                    if (errors.materialId) setErrors({ ...errors, materialId: '' })
                  }}
                  options={materialOptions}
                  error={errors.materialId}
                  required
                  disabled={!formData.tecnologia || availableMaterials.length === 0}
                />
              )}

              {/* PASSO 3: Características (apenas se o material tiver características) */}
              {availableCaracteristicas.length > 0 && (
                <Select
                  label="Características / Acabamento (opcional)"
                  placeholder="Selecione a característica"
                  value={formData.caracteristicaId || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, caracteristicaId: e.target.value })
                  }}
                  options={caracteristicaOptions}
                />
              )}

              {/* Título do serviço (com opção de gerar automaticamente) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Título / Nome do serviço
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGenerateName}
                      onChange={(e) => setAutoGenerateName(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">Gerar automaticamente</span>
                  </label>
                </div>
                <Input
                  type="text"
                  placeholder="Ex: Lona 440g 3m x 2m (2 un)"
                  value={formData.service}
                  onChange={(e) => {
                    setFormData({ ...formData, service: e.target.value })
                    setAutoGenerateName(false) // Desativa auto-geração quando usuário edita manualmente
                    if (errors.service) setErrors({ ...errors, service: '' })
                  }}
                  error={errors.service}
                  required
                  disabled={autoGenerateName}
                />
              </div>

              {/* Tamanho */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Largura"
                  type="text"
                  placeholder="Ex: 3m ou 300cm"
                  value={formData.width}
                  onChange={(e) => {
                    setFormData({ ...formData, width: e.target.value })
                    if (errors.width) setErrors({ ...errors, width: '' })
                  }}
                  error={errors.width}
                  required
                />
                <Input
                  label="Altura"
                  type="text"
                  placeholder="Ex: 2m ou 200cm"
                  value={formData.height}
                  onChange={(e) => {
                    setFormData({ ...formData, height: e.target.value })
                    if (errors.height) setErrors({ ...errors, height: '' })
                  }}
                  error={errors.height}
                  required
                />
              </div>

              {/* Quantidade */}
              <Input
                label="Quantidade"
                type="number"
                placeholder="1"
                value={formData.quantity.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setFormData({ ...formData, quantity: value })
                  if (errors.quantity) setErrors({ ...errors, quantity: '' })
                }}
                error={errors.quantity}
                required
                min="1"
              />

              {/* Prazo */}
              <Input
                label="Prazo desejado"
                type="text"
                placeholder="Ex: 3 dias, Hoje, Amanhã, 15/12/2024"
                value={formData.deadline}
                onChange={(e) => {
                  setFormData({ ...formData, deadline: e.target.value })
                  if (errors.deadline) setErrors({ ...errors, deadline: '' })
                }}
                error={errors.deadline}
                required
              />

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Informações adicionais sobre o pedido..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar pedido'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
