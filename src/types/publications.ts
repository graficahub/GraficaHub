/**
 * Tipos para sistema de publicações e versionamento
 */

import { MaterialCatalogItem } from '@/data/materialCatalog'
import { Coupon } from './coupons'

export interface PublicationSnapshot {
  id: string
  name: string
  description?: string
  createdAt: string // ISO date
  // Snapshots dos dados publicados
  materialCatalog: MaterialCatalogItem[]
  materialTechnologies: string[]
  coupons: Coupon[]
  // Outros dados globais podem ser adicionados aqui
  settings?: any
}

const PUBLISH_HISTORY_KEY = 'GH_PUBLISH_HISTORY'
const MAX_HISTORY_ITEMS = 3

/**
 * Carrega o histórico de publicações
 */
export function loadPublishHistory(): PublicationSnapshot[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(PUBLISH_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar histórico de publicações:', err)
    return []
  }
}

/**
 * Salva o histórico de publicações (mantém apenas as 3 últimas)
 */
export function savePublishHistory(history: PublicationSnapshot[]): void {
  if (typeof window === 'undefined') return
  
  try {
    // Mantém apenas as 3 mais recentes
    const limited = history.slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(PUBLISH_HISTORY_KEY, JSON.stringify(limited))
  } catch (err) {
    console.error('❌ Erro ao salvar histórico de publicações:', err)
  }
}

/**
 * Cria um snapshot da publicação atual
 */
export function createPublicationSnapshot(
  name: string,
  description?: string
): PublicationSnapshot | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Lê todos os dados publicados atuais
    const materialCatalogStr = localStorage.getItem('GH_PUBLISHED_MATERIAL_CATALOG')
    const materialCatalog = materialCatalogStr ? JSON.parse(materialCatalogStr) : []
    
    const materialTechnologiesStr = localStorage.getItem('GH_PUBLISHED_MATERIAL_TECHNOLOGIES')
    const materialTechnologies = materialTechnologiesStr ? JSON.parse(materialTechnologiesStr) : []
    
    const couponsStr = localStorage.getItem('GH_PUBLISHED_COUPONS')
    const coupons = couponsStr ? JSON.parse(couponsStr) : []
    
    const snapshot: PublicationSnapshot = {
      id: `PUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      materialCatalog,
      materialTechnologies,
      coupons,
    }
    
    // Adiciona ao histórico
    const history = loadPublishHistory()
    history.unshift(snapshot) // Adiciona no início
    savePublishHistory(history)
    
    return snapshot
  } catch (err) {
    console.error('❌ Erro ao criar snapshot:', err)
    return null
  }
}

/**
 * Restaura uma publicação do histórico
 */
export function restorePublication(snapshot: PublicationSnapshot): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Restaura todos os dados do snapshot
    localStorage.setItem('GH_PUBLISHED_MATERIAL_CATALOG', JSON.stringify(snapshot.materialCatalog))
    localStorage.setItem('GH_PUBLISHED_MATERIAL_TECHNOLOGIES', JSON.stringify(snapshot.materialTechnologies))
    localStorage.setItem('GH_PUBLISHED_COUPONS', JSON.stringify(snapshot.coupons))
    
    // Copia para draft também (para rascunho começar igual ao publicado)
    localStorage.setItem('GH_DRAFT_MATERIAL_CATALOG', JSON.stringify(snapshot.materialCatalog))
    localStorage.setItem('GH_DRAFT_MATERIAL_TECHNOLOGIES', JSON.stringify(snapshot.materialTechnologies))
    localStorage.setItem('GH_DRAFT_COUPONS', JSON.stringify(snapshot.coupons))
    
    return true
  } catch (err) {
    console.error('❌ Erro ao restaurar publicação:', err)
    return false
  }
}

/**
 * Obtém a publicação mais recente (atual)
 */
export function getCurrentPublication(): PublicationSnapshot | null {
  const history = loadPublishHistory()
  return history.length > 0 ? history[0] : null
}

