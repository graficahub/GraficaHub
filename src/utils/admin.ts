/**
 * Utilitários para gerenciamento do administrador
 */

const ADMIN_EMAIL = 'admin@graficahub.com.br'
const DEFAULT_ADMIN_PASSWORD = 'graficahub123'
const ADMIN_PASSWORD_KEY = 'GH_ADMIN_PASSWORD'
const CURRENT_USER_KEY = 'GH_CURRENT_USER'

export type UserRole = 'admin' | 'user'

export interface CurrentUser {
  email: string
  role: UserRole
}

/**
 * Obtém a senha do admin (do localStorage ou padrão)
 */
export function getAdminPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD
  
  try {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY)
    return stored || DEFAULT_ADMIN_PASSWORD
  } catch (err) {
    console.error('❌ Erro ao carregar senha do admin:', err)
    return DEFAULT_ADMIN_PASSWORD
  }
}

/**
 * Define a senha do admin
 */
export function setAdminPassword(password: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, password)
  } catch (err) {
    console.error('❌ Erro ao salvar senha do admin:', err)
  }
}

/**
 * Verifica se o email é do admin
 */
export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/**
 * Verifica se a senha está correta para o admin
 */
export function validateAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword()
  return password === adminPassword
}

/**
 * Obtém o usuário atual do localStorage
 */
export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.error('❌ Erro ao carregar usuário atual:', err)
    return null
  }
}

/**
 * Define o usuário atual no localStorage
 */
export function setCurrentUser(user: CurrentUser): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('❌ Erro ao salvar usuário atual:', err)
  }
}

/**
 * Remove o usuário atual (logout)
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CURRENT_USER_KEY)
  } catch (err) {
    console.error('❌ Erro ao remover usuário atual:', err)
  }
}

/**
 * Verifica se o usuário atual é admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Verifica se o usuário atual é user normal
 */
export function isUser(): boolean {
  const user = getCurrentUser()
  return user?.role === 'user'
}


