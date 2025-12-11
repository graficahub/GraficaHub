'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { getUserRole } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  display_name?: string
  company_name?: string
  role: 'admin' | 'user'
  address?: {
    city?: string
    state?: string
  } | string
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterState, setFilterState] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          .select('id, email, role, name, full_name, display_name, company_name, address')
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

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter((u) => {
        const name = u.name || u.full_name || u.display_name || u.company_name || ''
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Filtro por cidade
    if (filterCity) {
      filtered = filtered.filter((u) => {
        const address = typeof u.address === 'string' ? JSON.parse(u.address) : u.address
        return address?.city?.toLowerCase().includes(filterCity.toLowerCase())
      })
    }

    // Filtro por estado
    if (filterState) {
      filtered = filtered.filter((u) => {
        const address = typeof u.address === 'string' ? JSON.parse(u.address) : u.address
        return address?.state?.toLowerCase().includes(filterState.toLowerCase())
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterCity, filterState])


  const getUserDisplayName = (user: User) => {
    return user.name || user.full_name || user.display_name || user.company_name || '-'
  }

  const getUserAddress = (user: User) => {
    if (!user.address) return null
    try {
      const address = typeof user.address === 'string' ? JSON.parse(user.address) : user.address
      return address
    } catch {
      return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
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
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Filtrar por cidade"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-40"
              />
              <Input
                type="text"
                placeholder="Filtrar por estado"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cidade/Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      {users.length === 0
                        ? 'Nenhum usuário cadastrado ainda.'
                        : 'Nenhum usuário encontrado com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const address = getUserAddress(user)
                    return (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/admin/usuarios/${encodeURIComponent(user.email)}`)}
                        className={`border-b border-white/5 transition-colors cursor-pointer ${
                          index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                        } hover:bg-white/10`}
                      >
                        <td className="py-3 px-4 text-sm text-white">{getUserDisplayName(user)}</td>
                        <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-300">
                          {address?.city && address?.state
                            ? `${address.city}/${address.state}`
                            : '-'}
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
    </div>
  )
}

