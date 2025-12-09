'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getAdminPassword, setAdminPassword, validateAdminPassword } from '@/utils/admin'

export default function AdminConfiguracoesPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      // Validações
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('Por favor, preencha todos os campos.')
        setIsLoading(false)
        return
      }

      // Verifica senha atual
      if (!validateAdminPassword(formData.currentPassword)) {
        setError('Senha atual incorreta.')
        setIsLoading(false)
        return
      }

      // Verifica se a nova senha tem pelo menos 6 caracteres
      if (formData.newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres.')
        setIsLoading(false)
        return
      }

      // Verifica se as senhas coincidem
      if (formData.newPassword !== formData.confirmPassword) {
        setError('As senhas não coincidem.')
        setIsLoading(false)
        return
      }

      // Verifica se a nova senha é diferente da atual
      if (formData.newPassword === formData.currentPassword) {
        setError('A nova senha deve ser diferente da senha atual.')
        setIsLoading(false)
        return
      }

      // Salva a nova senha
      setAdminPassword(formData.newPassword)
      
      // Limpa o formulário
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError('Erro ao alterar senha. Tente novamente.')
      console.error('❌ Erro ao alterar senha:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações do Administrador</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Gerencie as configurações da sua conta administrativa
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="max-w-2xl">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Alterar Senha</h2>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">Senha alterada com sucesso!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Senha atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  setError('')
                }}
                required
              />

              <Input
                label="Nova senha"
                type="password"
                placeholder="Digite a nova senha (mínimo 6 caracteres)"
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  setError('')
                }}
                required
              />

              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Digite novamente a nova senha"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  setError('')
                }}
                required
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-slate-400">
                <strong className="text-blue-400">Dica:</strong> Use uma senha forte com pelo menos 6 caracteres.
                A senha é armazenada localmente no navegador.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


