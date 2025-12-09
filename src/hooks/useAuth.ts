'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  isAdminEmail,
  validateAdminPassword,
  setCurrentUser,
  getCurrentUser,
  clearCurrentUser,
  type UserRole,
} from '@/utils/admin'
import { logEvent } from '@/utils/logService'
import { generateGraficaId } from '@/utils/proposalPrivacy'

/**
 * Hook de autenticação local com localStorage
 * 
 * Implementação FAKE para testes de fluxo das telas.
 * Armazena usuários e sessão atual no localStorage.
 * 
 * TODO: Substituir por integração real com Supabase no futuro
 */

export type Printer = {
  id: string
  name: string
  width: string
  inkTechnology: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface LocalUser {
  companyName: string
  email: string
  cpfCnpj: string | null
  printers: Printer[]
  displayName: string
  phone: string | null
  address: Address | null
  logoUrl: string | null
  graficaId?: string // Identificador único da gráfica
}

interface StoredUser {
  companyName: string
  email: string
  password: string
  cpfCnpj: string | null
  printers: Printer[]
  displayName: string
  phone: string | null
  address: Address | null
  logoUrl: string | null
  graficaId?: string // Identificador único da gráfica
  status?: 'ativo' | 'suspenso' // Status da conta
}

const STORAGE_USERS_KEY = 'graficaHubUsers'
const STORAGE_CURRENT_USER_KEY = 'graficaHubCurrentUser'

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Carrega usuário atual do localStorage na inicialização
  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = () => {
    // Verifica se está no cliente (browser)
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const storedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY)
      console.log('🔍 Verificando localStorage:', { hasStoredUser: !!storedUser })
      if (storedUser) {
        const userData: LocalUser = JSON.parse(storedUser)
        // Garante que campos opcionais existam (compatibilidade com dados antigos)
        const normalizedUser: LocalUser = {
          ...userData,
          cpfCnpj: userData.cpfCnpj ?? null,
          printers: userData.printers ?? [],
          displayName: userData.displayName ?? userData.companyName,
          phone: userData.phone ?? null,
          address: userData.address ?? null,
          logoUrl: userData.logoUrl ?? null
        }
        setUser(normalizedUser)
        console.log('✅ Usuário carregado do localStorage:', normalizedUser.email)
      } else {
        console.log('ℹ️ Nenhum usuário encontrado no localStorage')
        setUser(null)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar usuário:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
      console.log('✅ Hook useAuth inicializado, isLoading:', false)
    }
  }

  const getStoredUsers = (): StoredUser[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('❌ Erro ao carregar usuários:', err)
      return []
    }
  }

  const saveStoredUsers = (users: StoredUser[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
    } catch (err) {
      console.error('❌ Erro ao salvar usuários:', err)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    console.log('🔐 Tentando fazer login com email:', email)

    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verifica se é login de admin
      if (isAdminEmail(email)) {
        if (validateAdminPassword(password)) {
          // Login de admin bem-sucedido
          const adminUser = {
            email: email,
            role: 'admin' as UserRole,
          }
          
          setCurrentUser(adminUser)
          setUser(null) // Admin não usa LocalUser
          setError(null)
          setIsLoading(false)
          
          // Log de login bem-sucedido
          logEvent('info', 'Login de administrador realizado com sucesso', {
            userId: email,
            context: 'LOGIN',
          })
          
          console.log('✅ Login de admin bem-sucedido! Redirecionando para /admin')
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
          try {
            router.replace('/admin')
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
                window.location.href = '/admin'
              }
            }, 1000)
          } catch (routerError) {
            console.error('❌ Erro no router, usando window.location:', routerError)
            if (typeof window !== 'undefined') {
              window.location.href = '/admin'
            }
          }
          return
        } else {
          const errorMsg = 'Senha de administrador incorreta.'
          // Log de falha de login
          logEvent('warn', 'Tentativa de login de admin com senha incorreta', {
            userId: email,
            context: 'LOGIN',
            details: { email },
          })
          console.error('❌ Senha de admin incorreta')
          setError(errorMsg)
          setIsLoading(false)
          throw new Error(errorMsg)
        }
      }

      // Login de usuário normal
      const users = getStoredUsers()
      console.log('📋 Usuários cadastrados:', users.length)
      
      const foundUser = users.find(u => u.email === email)

      if (!foundUser) {
        const errorMsg = users.length === 0 
          ? 'Nenhuma conta encontrada. Por favor, crie uma conta primeiro na aba "Criar conta".'
          : 'Email ou senha incorretos. Verifique suas credenciais ou crie uma conta.'
        // Log de tentativa de login com email não cadastrado
        logEvent('warn', 'Tentativa de login com email não cadastrado', {
          context: 'LOGIN',
          details: { email, totalUsers: users.length },
        })
        console.error('❌ Usuário não encontrado. Total de usuários:', users.length)
        setError(errorMsg)
        setIsLoading(false)
        throw new Error(errorMsg)
      }

      if (foundUser.password !== password) {
        const errorMsg = 'Email ou senha incorretos. Verifique suas credenciais.'
        // Log de tentativa de login com senha incorreta
        logEvent('warn', 'Tentativa de login com senha incorreta', {
          userId: email,
          context: 'LOGIN',
          details: { email },
        })
        console.error('❌ Senha incorreta')
        setError(errorMsg)
        setIsLoading(false)
        throw new Error(errorMsg)
      }

      // Verifica se o usuário está suspenso
      if (foundUser.status === 'suspenso') {
        const errorMsg = 'Sua conta foi suspensa. Entre em contato com o suporte.'
        // Log de tentativa de login com conta suspensa
        logEvent('warn', 'Tentativa de login com conta suspensa', {
          userId: email,
          context: 'LOGIN',
          details: { email },
        })
        console.error('❌ Usuário suspenso')
        setError(errorMsg)
        setIsLoading(false)
        throw new Error(errorMsg)
      }

      // Login bem-sucedido - constrói LocalUser a partir do StoredUser
      const userData: LocalUser = {
        companyName: foundUser.companyName,
        email: foundUser.email,
        cpfCnpj: foundUser.cpfCnpj ?? null,
        printers: foundUser.printers ?? [],
        displayName: foundUser.displayName ?? foundUser.companyName,
        phone: foundUser.phone ?? null,
        address: foundUser.address ?? null,
        logoUrl: foundUser.logoUrl ?? null
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(userData))
      }
      setUser(userData)
      setError(null)
      
      // Log de login bem-sucedido
      logEvent('info', 'Login realizado com sucesso', {
        userId: email,
        context: 'LOGIN',
        details: { email, companyName: userData.companyName },
      })
      
      // Verifica se precisa completar onboarding
      const needsOnboarding = !userData.cpfCnpj || userData.cpfCnpj.trim() === ''
      const redirectPath = needsOnboarding ? '/setup' : '/dashboard'
      
      console.log(`✅ Login bem-sucedido! Redirecionando para ${redirectPath}`, { needsOnboarding })
      
      // Aguarda um pouco para garantir que o estado seja atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setIsLoading(false)

      // Tenta usar router.replace primeiro, com fallback para window.location
      try {
        router.replace(redirectPath)
        // Fallback: se após 1 segundo ainda estiver na mesma página, força redirecionamento
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== redirectPath) {
            console.log('⚠️ Router não funcionou, usando window.location como fallback')
            window.location.href = redirectPath
          }
        }, 1000)
      } catch (routerError) {
        console.error('❌ Erro no router, usando window.location:', routerError)
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath
        }
      }
    } catch (err) {
      // Log de erro no login
      logEvent('error', 'Erro ao processar login', {
        context: 'LOGIN',
        details: { email, error: err instanceof Error ? err.message : String(err) },
      })
      console.error('❌ Erro no login:', err)
      setIsLoading(false)
      throw err
    }
  }

  const register = async (companyName: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    console.log('📝 Tentando criar conta:', { email, companyName })

    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))

      const users = getStoredUsers()

      // Verifica se o email já existe
      const existingUser = users.find(u => u.email === email)
      if (existingUser) {
        const errorMsg = 'Este email já está cadastrado.'
        console.error('❌ Email já cadastrado')
        setError(errorMsg)
        setIsLoading(false)
        throw new Error(errorMsg)
      }

      // Adiciona novo usuário - inicia com campos padrão
      const newUser: StoredUser = {
        companyName,
        email,
        password,
        cpfCnpj: null,
        printers: [],
        displayName: companyName, // Inicialmente igual ao companyName
        phone: null,
        address: null,
        logoUrl: null,
        graficaId: generateGraficaId(), // Gera graficaId único
      }

      users.push(newUser)
      saveStoredUsers(users)

      // Log de cadastro de usuário
      logEvent('info', 'Novo usuário cadastrado', {
        userId: email,
        context: 'USUARIO',
        details: { email, companyName },
      })

      // Define como usuário atual - novo usuário sempre precisa de onboarding
      const userData: LocalUser = {
        companyName,
        email,
        cpfCnpj: null,
        printers: [],
        displayName: companyName,
        phone: null,
        address: null,
        logoUrl: null,
        graficaId: newUser.graficaId,
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(userData))
      }
      setUser(userData)
      setError(null)
      
      console.log('✅ Cadastro bem-sucedido! Redirecionando para /setup (onboarding obrigatório)')
      
      // Aguarda um pouco para garantir que o estado seja atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setIsLoading(false)

      // Novo usuário sempre vai para /onboarding para completar cadastro
      try {
        router.replace('/setup')
        // Fallback: se após 1 segundo ainda estiver na mesma página, força redirecionamento
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/setup') {
            console.log('⚠️ Router não funcionou, usando window.location como fallback')
            window.location.href = '/setup'
          }
        }, 1000)
      } catch (routerError) {
        console.error('❌ Erro no router, usando window.location:', routerError)
        if (typeof window !== 'undefined') {
          window.location.href = '/setup'
        }
      }
    } catch (err) {
      console.error('❌ Erro no cadastro:', err)
      setIsLoading(false)
      throw err
    }
  }

  const logout = async () => {
    setIsLoading(true)
    setError(null)

    console.log('🚪 Fazendo logout...')

    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))

      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY)
        clearCurrentUser()
      }
      setUser(null)
      setError(null)
      setIsLoading(false)

      console.log('✅ Logout bem-sucedido! Redirecionando para /auth')
      router.replace('/auth')
    } catch (err) {
      console.error('❌ Erro ao fazer logout:', err)
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  /**
   * Atualiza os dados do usuário atual (usado após onboarding)
   * Atualiza tanto o localStorage quanto o estado do hook
   */
  const updateUser = async (updates: Partial<LocalUser>) => {
    if (!user) {
      throw new Error('Nenhum usuário logado')
    }

    console.log('🔄 Atualizando dados do usuário:', updates)

    try {
      // Atualiza o objeto do usuário
      const updatedUser: LocalUser = {
        ...user,
        ...updates
      }

      // Atualiza o estado local
      setUser(updatedUser)

      // Atualiza o localStorage do usuário atual
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser))
      }

      // Atualiza também na lista de usuários (para manter sincronizado)
      const users = getStoredUsers()
      const userIndex = users.findIndex(u => u.email === user.email)
      
      if (userIndex !== -1) {
        // Mantém a senha do StoredUser, mas atualiza os outros campos
        // Garante que graficaId existe (gera se não tiver para compatibilidade com dados antigos)
        if (!users[userIndex].graficaId) {
          users[userIndex].graficaId = generateGraficaId()
        }
        users[userIndex] = {
          ...users[userIndex],
          companyName: updatedUser.companyName,
          cpfCnpj: updatedUser.cpfCnpj,
          printers: updatedUser.printers,
          displayName: updatedUser.displayName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          logoUrl: updatedUser.logoUrl,
          graficaId: users[userIndex].graficaId, // Mantém o graficaId existente
        }
        saveStoredUsers(users)
      }

      console.log('✅ Dados do usuário atualizados com sucesso')
      return updatedUser
    } catch (err) {
      console.error('❌ Erro ao atualizar usuário:', err)
      throw err
    }
  }

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    updateUser,
  }
}
