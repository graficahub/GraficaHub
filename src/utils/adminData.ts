/**
 * Utilitários para gerenciamento de dados publicados vs rascunho no admin
 * 
 * Regras:
 * - Usuários normais sempre leem GH_PUBLISHED_*
 * - Admin sempre edita GH_DRAFT_*
 * - Preview do admin lê GH_DRAFT_* mas não edita
 */

const PREVIEW_MODE_KEY = 'GH_ADMIN_PREVIEW_MODE'
const DIRTY_STATE_KEY = 'GH_ADMIN_DIRTY_STATE'

/**
 * Verifica se está em modo preview
 */
export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    return localStorage.getItem(PREVIEW_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Define o modo preview
 */
export function setPreviewMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  
  try {
    if (enabled) {
      localStorage.setItem(PREVIEW_MODE_KEY, 'true')
    } else {
      localStorage.removeItem(PREVIEW_MODE_KEY)
    }
  } catch (err) {
    console.error('❌ Erro ao definir modo preview:', err)
  }
}

/**
 * Verifica se há alterações não salvas (dirty state)
 */
export function hasUnsavedChanges(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    return localStorage.getItem(DIRTY_STATE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Marca como tendo alterações não salvas
 */
export function markAsDirty(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(DIRTY_STATE_KEY, 'true')
  } catch (err) {
    console.error('❌ Erro ao marcar como dirty:', err)
  }
}

/**
 * Limpa o estado dirty
 */
export function clearDirtyState(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(DIRTY_STATE_KEY)
  } catch (err) {
    console.error('❌ Erro ao limpar dirty state:', err)
  }
}

/**
 * Obtém a chave correta baseada no contexto
 * @param baseKey - Chave base (ex: 'MATERIAL_CATALOG')
 * @param isAdmin - Se é admin editando
 * @param isPreview - Se está em modo preview
 */
export function getStorageKey(baseKey: string, isAdmin: boolean = false, isPreview: boolean = false): string {
  // Preview sempre lê draft
  if (isPreview) {
    return `GH_DRAFT_${baseKey}`
  }
  
  // Admin sempre edita draft
  if (isAdmin) {
    return `GH_DRAFT_${baseKey}`
  }
  
  // Usuário comum sempre lê published
  return `GH_PUBLISHED_${baseKey}`
}

/**
 * Carrega dados publicados ou rascunho baseado no contexto
 */
export function loadData<T>(baseKey: string, defaultValue: T, isAdmin: boolean = false): T {
  if (typeof window === 'undefined') return defaultValue
  
  const isPreview = isPreviewMode()
  const storageKey = getStorageKey(baseKey, isAdmin, isPreview)
  
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Se não existe draft e é admin, copia do published
    if (isAdmin && !isPreview && storageKey.startsWith('GH_DRAFT_')) {
      const publishedKey = `GH_PUBLISHED_${baseKey}`
      const published = localStorage.getItem(publishedKey)
      if (published) {
        const publishedData = JSON.parse(published)
        // Salva como draft
        localStorage.setItem(storageKey, published)
        return publishedData
      }
    }
    
    // Se não existe published e é usuário comum, salva o default como published
    if (!isAdmin && !isPreview && storageKey.startsWith('GH_PUBLISHED_')) {
      localStorage.setItem(storageKey, JSON.stringify(defaultValue))
    }
    
    return defaultValue
  } catch (err) {
    console.error(`❌ Erro ao carregar ${baseKey}:`, err)
    return defaultValue
  }
}

/**
 * Salva dados (sempre em draft se for admin)
 */
export function saveData<T>(baseKey: string, data: T, isAdmin: boolean = false): void {
  if (typeof window === 'undefined') return
  
  const storageKey = getStorageKey(baseKey, isAdmin, false)
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(data))
    if (isAdmin) {
      markAsDirty()
    }
  } catch (err) {
    console.error(`❌ Erro ao salvar ${baseKey}:`, err)
  }
}

/**
 * Publica dados do draft para published
 */
export function publishData(baseKey: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const draftKey = `GH_DRAFT_${baseKey}`
    const publishedKey = `GH_PUBLISHED_${baseKey}`
    
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      localStorage.setItem(publishedKey, draft)
      return true
    }
    return false
  } catch (err) {
    console.error(`❌ Erro ao publicar ${baseKey}:`, err)
    return false
  }
}

/**
 * Descarta rascunho, copiando published para draft
 */
export function discardDraft(baseKey: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const draftKey = `GH_DRAFT_${baseKey}`
    const publishedKey = `GH_PUBLISHED_${baseKey}`
    
    const published = localStorage.getItem(publishedKey)
    if (published) {
      localStorage.setItem(draftKey, published)
      return true
    }
    return false
  } catch (err) {
    console.error(`❌ Erro ao descartar rascunho de ${baseKey}:`, err)
    return false
  }
}

/**
 * Lista todas as chaves de dados gerenciados
 */
export const MANAGED_DATA_KEYS = [
  'MATERIAL_CATALOG',
  'MATERIAL_TECHNOLOGIES',
  'COUPONS',
] as const

/**
 * Publica todos os dados de rascunho
 */
export function publishAllDrafts(): { success: number; failed: string[] } {
  const failed: string[] = []
  let success = 0
  
  MANAGED_DATA_KEYS.forEach((key) => {
    if (publishData(key)) {
      success++
    } else {
      failed.push(key)
    }
  })
  
  clearDirtyState()
  return { success, failed }
}

/**
 * Descarta todos os rascunhos
 */
export function discardAllDrafts(): { success: number; failed: string[] } {
  const failed: string[] = []
  let success = 0
  
  MANAGED_DATA_KEYS.forEach((key) => {
    if (discardDraft(key)) {
      success++
    } else {
      failed.push(key)
    }
  })
  
  clearDirtyState()
  return { success, failed }
}






