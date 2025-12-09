'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit, Trash2, Ticket, CheckCircle, XCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  loadCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/utils/couponsStorage'
import { Coupon, CouponType, CouponScope, COUPON_TYPE_LABELS, COUPON_SCOPE_LABELS } from '@/types/coupons'
// markAsDirty já é chamado automaticamente nas funções de storage

// Função auxiliar para obter usuários
function getStoredUsers() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem('graficaHubUsers')
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar usuários:', err)
    return []
  }
}

const AVAILABLE_TAGS = ['Pioneiro', 'Diamante', 'Ouro', 'Prata', 'Bronze']

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [users, setUsers] = useState<Array<{ email: string; companyName: string }>>([])

  const [formData, setFormData] = useState({
    code: '',
    type: 'valor_fixo' as CouponType,
    value: '',
    scope: 'todos' as CouponScope,
    userIds: [] as string[],
    tags: [] as string[],
    minOrderValue: '',
    maxUsesTotal: '',
    maxUsesPerUser: '',
    startsAt: '',
    endsAt: '',
    active: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const couponsData = loadCoupons()
    setCoupons(couponsData)
    
    const usersData = getStoredUsers()
    setUsers(usersData.map((u: any) => ({ email: u.email, companyName: u.companyName })))
  }

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        scope: coupon.scope,
        userIds: coupon.userIds || [],
        tags: coupon.tags || [],
        minOrderValue: coupon.minOrderValue?.toString() || '',
        maxUsesTotal: coupon.maxUsesTotal?.toString() || '',
        maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '',
        startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : '',
        endsAt: coupon.endsAt ? coupon.endsAt.split('T')[0] : '',
        active: coupon.active,
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: '',
        type: 'valor_fixo',
        value: '',
        scope: 'todos',
        userIds: [],
        tags: [],
        minOrderValue: '',
        maxUsesTotal: '',
        maxUsesPerUser: '',
        startsAt: '',
        endsAt: '',
        active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCoupon(null)
  }

  const handleToggleUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }))
  }

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSave = () => {
    if (!formData.code || !formData.value) {
      alert('Preencha código e valor')
      return
    }

    const value = parseFloat(formData.value.replace(',', '.'))
    if (isNaN(value) || value <= 0) {
      alert('Valor inválido')
      return
    }

    const couponData: Omit<Coupon, 'id' | 'createdAt'> = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: value,
      scope: formData.scope,
      userIds: formData.scope === 'usuarios' ? formData.userIds : undefined,
      tags: formData.scope === 'tags' ? formData.tags : undefined,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue.replace(',', '.')) : undefined,
      maxUsesTotal: formData.maxUsesTotal ? parseInt(formData.maxUsesTotal) : undefined,
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
      endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
      active: formData.active,
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, couponData)
    } else {
      addCoupon(couponData)
    }

    loadData()
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCoupon(id)
      loadData()
    }
  }

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon(coupon.id, { active: !coupon.active })
    loadData()
  }

  const isCouponValid = (coupon: Coupon): boolean => {
    const now = new Date()
    if (coupon.startsAt && new Date(coupon.startsAt) > now) return false
    if (coupon.endsAt && new Date(coupon.endsAt) < now) return false
    return true
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Cupons e Descontos</h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Gerencie cupons e descontos disponíveis na plataforma
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Cupom
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Tabela de Cupons */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Escopo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Validade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum cupom cadastrado. Adicione o primeiro cupom.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon, index) => (
                    <tr
                      key={coupon.id}
                      className={`border-b border-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                      } hover:bg-white/10`}
                    >
                      <td className="py-3 px-4 text-sm text-white font-mono">{coupon.code}</td>
                      <td className="py-3 px-4 text-sm text-white">
                        {COUPON_TYPE_LABELS[coupon.type]}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {coupon.type === 'percentual'
                          ? `${coupon.value}%`
                          : coupon.type === 'frete_gratis'
                          ? 'Grátis'
                          : `R$ ${coupon.value.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {COUPON_SCOPE_LABELS[coupon.scope]}
                        {coupon.scope === 'usuarios' && coupon.userIds && (
                          <span className="text-xs text-slate-400 ml-1">
                            ({coupon.userIds.length} usuários)
                          </span>
                        )}
                        {coupon.scope === 'tags' && coupon.tags && (
                          <span className="text-xs text-slate-400 ml-1">
                            ({coupon.tags.join(', ')})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {coupon.startsAt && coupon.endsAt
                          ? `${new Date(coupon.startsAt).toLocaleDateString('pt-BR')} - ${new Date(coupon.endsAt).toLocaleDateString('pt-BR')}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              coupon.active && isCouponValid(coupon)
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {coupon.active && isCouponValid(coupon) ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            title={coupon.active ? 'Desativar' : 'Ativar'}
                          >
                            {coupon.active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenModal(coupon)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
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

      {/* Modal: Adicionar/Editar Cupom */}
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
                  {editingCoupon ? 'Editar Cupom' : 'Adicionar Cupom'}
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
                  label="Código do cupom"
                  type="text"
                  placeholder="Ex: GH50PIONEIRO"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />

                <Select
                  label="Tipo de desconto"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
                  options={Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />

                {formData.type !== 'frete_gratis' && (
                  <Input
                    label={formData.type === 'percentual' ? 'Valor (%)' : 'Valor (R$)'}
                    type="text"
                    placeholder={formData.type === 'percentual' ? 'Ex: 10' : 'Ex: 50,00'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                )}

                <Select
                  label="Escopo / Destino"
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value as CouponScope, userIds: [], tags: [] })
                  }
                  options={Object.entries(COUPON_SCOPE_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />

                {formData.scope === 'usuarios' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Usuários específicos
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                      {users.map((user) => (
                        <label
                          key={user.email}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.userIds.includes(user.email)}
                            onChange={() => handleToggleUser(user.email)}
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">
                            {user.companyName} ({user.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {formData.scope === 'tags' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleToggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Valor mínimo de pedido (R$)"
                    type="text"
                    placeholder="Opcional"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  />
                  <Input
                    label="Máximo de usos (total)"
                    type="number"
                    placeholder="Opcional"
                    value={formData.maxUsesTotal}
                    onChange={(e) => setFormData({ ...formData, maxUsesTotal: e.target.value })}
                  />
                </div>

                <Input
                  label="Máximo de usos por usuário"
                  type="number"
                  placeholder="Opcional"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Data inicial"
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                  <Input
                    label="Data final"
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white">Cupom ativo</span>
                  </label>
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
                  disabled={!formData.code || !formData.value}
                >
                  {editingCoupon ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

