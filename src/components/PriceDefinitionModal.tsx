'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calculator } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface PriceDefinitionModalProps {
  isOpen: boolean
  materialName: string
  width: number // em metros
  height: number // em metros
  onClose: () => void
  onConfirm: (precoPorM2: number) => void
}

export default function PriceDefinitionModal({
  isOpen,
  materialName,
  width,
  height,
  onClose,
  onConfirm,
}: PriceDefinitionModalProps) {
  const [valorFinal, setValorFinal] = useState('')
  const [precoPorM2, setPrecoPorM2] = useState('')
  const [mode, setMode] = useState<'final' | 'm2'>('final')

  const area = width * height

  useEffect(() => {
    if (isOpen) {
      setValorFinal('')
      setPrecoPorM2('')
      setMode('final')
    }
  }, [isOpen])

  // Sincronização automática
  useEffect(() => {
    if (mode === 'final' && valorFinal) {
      const valor = parseFloat(valorFinal.replace(',', '.'))
      if (!isNaN(valor) && area > 0) {
        const preco = valor / area
        setPrecoPorM2(preco.toFixed(2))
      }
    } else if (mode === 'm2' && precoPorM2) {
      const preco = parseFloat(precoPorM2.replace(',', '.'))
      if (!isNaN(preco) && area > 0) {
        const valor = preco * area
        setValorFinal(valor.toFixed(2))
      }
    }
  }, [valorFinal, precoPorM2, mode, area])

  const handleConfirm = () => {
    const preco = parseFloat(precoPorM2.replace(',', '.'))
    if (!isNaN(preco) && preco > 0) {
      onConfirm(preco)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Definir Preço</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-slate-300 mb-1">
            <strong>Material:</strong> {materialName}
          </p>
          <p className="text-sm text-slate-400">
            Dimensões: {width}m × {height}m = {area.toFixed(2)}m²
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Opção A: Valor Final do Pedido (R$)
            </label>
            <Input
              type="text"
              value={valorFinal}
              onChange={(e) => {
                setValorFinal(e.target.value)
                setMode('final')
              }}
              placeholder="0,00"
              onFocus={() => setMode('final')}
            />
          </div>

          <div className="text-center text-slate-400">ou</div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Opção B: Preço por m² (R$/m²)
            </label>
            <Input
              type="text"
              value={precoPorM2}
              onChange={(e) => {
                setPrecoPorM2(e.target.value)
                setMode('m2')
              }}
              placeholder="0,00"
              onFocus={() => setMode('m2')}
            />
          </div>

          {precoPorM2 && valorFinal && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400">
                <strong>Resumo:</strong> R$ {parseFloat(precoPorM2.replace(',', '.')).toFixed(2)}/m² × {area.toFixed(2)}m² = R$ {parseFloat(valorFinal.replace(',', '.')).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            disabled={!precoPorM2 || parseFloat(precoPorM2.replace(',', '.')) <= 0}
          >
            Confirmar
          </Button>
        </div>
      </motion.div>
    </div>
  )
}





