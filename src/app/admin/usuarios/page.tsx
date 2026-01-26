'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface User {
  companyName: string
  email: string
  address?: {
    city?: string
    state?: string
  }
  createdAt?: string
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterState, setFilterState] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('graficaHubUsers')
      if (stored) {
        const allUsers = JSON.parse(stored)
        // Remove a senha dos dados exibidos
        const usersWithoutPassword = allUsers.map((u: any) => ({
          companyName: u.companyName,
          email: u.email,
          address: u.address || null,
          createdAt: u.createdAt || null,
        }))
        setUsers(usersWithoutPassword)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar usuários:', err)
    }
  }

  useEffect(() => {
    let filtered = users

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por cidade
    if (filterCity) {
      filtered = filtered.filter(
        (u) => u.address?.city?.toLowerCase().includes(filterCity.toLowerCase())
      )
    }

    // Filtro por estado
    if (filterState) {
      filtered = filtered.filter(
        (u) => u.address?.state?.toLowerCase().includes(filterState.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterCity, filterState])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return '-'
    }
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nome da Gráfica</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cidade/Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Data de Cadastro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {users.length === 0
                        ? 'Nenhum usuário cadastrado ainda.'
                        : 'Nenhum usuário encontrado com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.email}
                      onClick={() => router.push(`/admin/usuarios/${encodeURIComponent(user.email)}`)}
                      className={`border-b border-white/5 transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                      } hover:bg-white/10`}
                    >
                      <td className="py-3 px-4 text-sm text-white">{user.companyName}</td>
                      <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {user.address?.city && user.address?.state
                          ? `${user.address.city}/${user.address.state}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

