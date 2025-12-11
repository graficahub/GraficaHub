'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Edit2, Shield, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { getUserRole } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name?: string | null
  company_name?: string | null
  phone?: string | null
  created_at?: string | null
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    company_name: '',
    phone: '',
  })

  useEffect(() => {
    let isCancelled = false

    async function loadUsers() {
      setIsLoading(true)
      setError(null)

      try {
        // Verifica sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Erro ao obter sessão em /admin/usuarios:', sessionError)
          if (!isCancelled) {
            setIsLoading(false)
            router.replace('/login')
          }
          return
        }

        if (!session?.user) {
          console.warn('⚠️ Nenhum usuário em sessão em /admin/usuarios')
          if (!isCancelled) {
            setIsLoading(false)
            router.replace('/login')
          }
          return
        }

        // Verifica se é admin (double-check)
        const role = await getUserRole(session.user.id)
        if (role !== 'admin') {
          console.warn('⚠️ Usuário não é admin, redirecionando para /dashboard')
          if (!isCancelled) {
            setIsLoading(false)
            router.replace('/dashboard')
          }
          return
        }

        // Busca todos os usuários da tabela users
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email, role, name, company_name, phone, created_at')
          .order('email', { ascending: true })

        if (fetchError) {
          console.error('❌ Erro ao buscar usuários no Supabase:', fetchError)
          console.error('Detalhes do erro:', {
            code: fetchError.code,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
          })
          
          // Trata erros de RLS/permissão
          if (fetchError.code === 'PGRST301' || fetchError.message?.includes('permission denied') || fetchError.message?.includes('RLS')) {
            if (!isCancelled) {
              setError('Você não tem permissão para visualizar a lista de usuários.')
              setIsLoading(false)
            }
            return
          }

          // Outros erros
          if (!isCancelled) {
            setError('Erro ao carregar lista de usuários. Tente novamente.')
            setIsLoading(false)
          }
          return
        }

        // Sucesso - salva os dados
        if (!isCancelled) {
          setUsers(data || [])
          setIsLoading(false)
        }
      } catch (err) {
        console.error('❌ Erro inesperado ao carregar usuários:', err)
        if (!isCancelled) {
          setError('Erro inesperado ao carregar usuários.')
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isCancelled = true
    }
  }, [router])

  useEffect(() => {
    let filtered = users

    // Filtro por busca (email e nome)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((u) => {
        return (
          (u.email ?? '').toLowerCase().includes(term) ||
          (u.name ?? '').toLowerCase().includes(term)
        )
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm])



  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  // Função para abrir modal de edição
  function openEditModal(user: User) {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      company_name: user.company_name || '',
      phone: user.phone || '',
    })
  }

  // Função para salvar edição
  async function handleSaveEdit() {
    if (!editingUser) return
    setIsSavingEdit(true)

    try {
      const { id } = editingUser
      const { name, company_name, phone } = editForm

      const { error } = await supabase
        .from('users')
        .update({ name, company_name, phone })
        .eq('id', id)

      if (error) {
        console.error('Erro ao salvar usuário:', error)
        alert('Erro ao salvar alterações do usuário.')
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, name, company_name, phone } : u
        )
      )

      setEditingUser(null)
    } catch (err) {
      console.error('Erro inesperado ao salvar usuário:', err)
      alert('Erro inesperado ao salvar alterações.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Função para alternar role
  async function handleToggleRole(user: User) {
    try {
      const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin'

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) {
        console.error('Erro ao atualizar role:', error)
        alert('Erro ao atualizar role do usuário.')
        return
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      )
    } catch (err) {
      console.error('Erro inesperado ao atualizar role:', err)
      alert('Erro inesperado ao atualizar role do usuário.')
    }
  }

  // Função para deletar usuário
  async function handleDeleteUser(user: User) {
    if (!confirm(`Tem certeza que deseja apagar o usuário ${user.email}?`)) {
      return
    }

    try {
      const { error } = await supabase.from('users').delete().eq('id', user.id)

      if (error) {
        console.error('Erro ao apagar usuário:', error)
        alert('Erro ao apagar usuário.')
        return
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err) {
      console.error('Erro inesperado ao apagar usuário:', err)
      alert('Erro inesperado ao apagar usuário.')
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="px-4 md:px-8 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Usuários</h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Gerencie todos os usuários cadastrados
            </p>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Card className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-slate-300">Carregando usuários...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="px-4 md:px-8 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Usuários</h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Gerencie todos os usuários cadastrados
            </p>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Card className="p-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Usuários</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Gerencie todos os usuários cadastrados
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Filtros e Busca */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Empresa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Telefone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {users.length === 0
                        ? 'Nenhum usuário cadastrado ainda.'
                        : 'Nenhum usuário encontrado com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-white/5 transition-colors ${
                          index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                        } hover:bg-white/10`}
                      >
                        <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-white">{user.name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">{user.company_name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">{user.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(user)
                              }}
                              className="text-sm px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1"
                              title="Editar usuário"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleRole(user)
                              }}
                              className="text-sm px-3 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white transition-colors flex items-center gap-1"
                              title={user.role === 'admin' ? 'Tornar usuário comum' : 'Tornar admin'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {user.role === 'admin' ? 'Tornar usuário' : 'Tornar admin'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteUser(user)
                              }}
                              className="text-sm px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white transition-colors flex items-center gap-1"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Editar Usuário</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  disabled={isSavingEdit}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome
                  </label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Nome do usuário"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Empresa
                  </label>
                  <Input
                    type="text"
                    value={editForm.company_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company_name: e.target.value })
                    }
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setEditingUser(null)}
                  disabled={isSavingEdit}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSaveEdit}
                  isLoading={isSavingEdit}
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

