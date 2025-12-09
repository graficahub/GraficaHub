/**
 * Utilitários para alternância de visão Admin ⇄ Usuário
 */

import { CurrentUser, setCurrentUser as setCurrentUserUtil } from './admin'

const IMPERSONATE_BACKUP_KEY = 'GH_ADMIN_IMPERSONATE_BACKUP'
const CURRENT_USER_KEY = 'GH_CURRENT_USER'

/**
 * Salva o backup do usuário admin atual
 */
export function saveAdminBackup(user: CurrentUser): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(IMPERSONATE_BACKUP_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('❌ Erro ao salvar backup do admin:', err)
  }
}

/**
 * Obtém o backup do usuário admin
 */
export function getAdminBackup(): CurrentUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(IMPERSONATE_BACKUP_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.error('❌ Erro ao carregar backup do admin:', err)
    return null
  }
}

/**
 * Remove o backup do admin
 */
export function clearAdminBackup(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(IMPERSONATE_BACKUP_KEY)
  } catch (err) {
    console.error('❌ Erro ao remover backup do admin:', err)
  }
}

/**
 * Verifica se está em modo de visualização como usuário
 */
export function isImpersonating(): boolean {
  return getAdminBackup() !== null
}

/**
 * Obtém um usuário de teste para visualização
 * Tenta pegar o primeiro usuário real, senão usa um genérico
 */
export function getTestUser(): CurrentUser {
  if (typeof window === 'undefined') {
    return {
      email: 'demo@graficahub.com.br',
      role: 'user',
    }
  }
  
  try {
    const stored = localStorage.getItem('graficaHubUsers')
    if (stored) {
      const users = JSON.parse(stored)
      if (users.length > 0) {
        return {
          email: users[0].email,
          role: 'user',
        }
      }
    }
  } catch (err) {
    console.error('❌ Erro ao obter usuário de teste:', err)
  }
  
  return {
    email: 'demo@graficahub.com.br',
    role: 'user',
  }
}

/**
 * Wrapper para setCurrentUser (exportado de admin.ts)
 */
export function setCurrentUser(user: CurrentUser): void {
  setCurrentUserUtil(user)
}

