/**
 * Utilitários para gerenciamento de materiais ativos do usuário
 */

import { MaterialCatalogItem } from '@/data/materialCatalog'
import { loadMaterialCatalog } from './materialCatalogStorage'

export interface UserActiveMaterial {
  materialId: string
  precoPadrao: number | null
}

const STORAGE_USER_MATERIALS_KEY = 'GH_USER_ACTIVE_MATERIALS'

/**
 * Carrega materiais ativos do usuário atual
 */
export function loadUserActiveMaterials(userEmail: string): UserActiveMaterial[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = `${STORAGE_USER_MATERIALS_KEY}_${userEmail}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar materiais ativos:', err)
    return []
  }
}

/**
 * Salva materiais ativos do usuário
 */
export function saveUserActiveMaterials(userEmail: string, materials: UserActiveMaterial[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = `${STORAGE_USER_MATERIALS_KEY}_${userEmail}`
    localStorage.setItem(key, JSON.stringify(materials))
  } catch (err) {
    console.error('❌ Erro ao salvar materiais ativos:', err)
  }
}

/**
 * Adiciona materiais ativos ao usuário
 */
export function addUserActiveMaterials(
  userEmail: string,
  materialIds: string[]
): void {
  const current = loadUserActiveMaterials(userEmail)
  const existingIds = new Set(current.map(m => m.materialId))
  
  const newMaterials = materialIds
    .filter(id => !existingIds.has(id))
    .map(id => ({ materialId: id, precoPadrao: null }))
  
  saveUserActiveMaterials(userEmail, [...current, ...newMaterials])
}

/**
 * Remove material ativo do usuário
 */
export function removeUserActiveMaterial(userEmail: string, materialId: string): void {
  const current = loadUserActiveMaterials(userEmail)
  const filtered = current.filter(m => m.materialId !== materialId)
  saveUserActiveMaterials(userEmail, filtered)
}

/**
 * Atualiza preço padrão de um material
 */
export function updateMaterialDefaultPrice(
  userEmail: string,
  materialId: string,
  precoPadrao: number | null
): void {
  const current = loadUserActiveMaterials(userEmail)
  const updated = current.map(m =>
    m.materialId === materialId ? { ...m, precoPadrao } : m
  )
  saveUserActiveMaterials(userEmail, updated)
}

/**
 * Busca materiais compatíveis com uma tecnologia
 */
export function getCompatibleMaterials(technology: string): MaterialCatalogItem[] {
  const catalog = loadMaterialCatalog()
  return catalog.filter(material =>
    material.tecnologias.some(tech =>
      tech.toLowerCase() === technology.toLowerCase() ||
      tech.toLowerCase().includes(technology.toLowerCase()) ||
      technology.toLowerCase().includes(tech.toLowerCase())
    )
  )
}

/**
 * Verifica se um material está ativo para o usuário
 */
export function isMaterialActive(userEmail: string, materialId: string): boolean {
  const active = loadUserActiveMaterials(userEmail)
  return active.some(m => m.materialId === materialId)
}

/**
 * Obtém preço padrão de um material
 */
export function getMaterialDefaultPrice(userEmail: string, materialId: string): number | null {
  const active = loadUserActiveMaterials(userEmail)
  const material = active.find(m => m.materialId === materialId)
  return material?.precoPadrao ?? null
}

/**
 * Obtém informações completas dos materiais ativos do usuário
 */
export function getUserActiveMaterialsWithDetails(userEmail: string): Array<{
  material: MaterialCatalogItem
  precoPadrao: number | null
}> {
  const active = loadUserActiveMaterials(userEmail)
  const catalog = loadMaterialCatalog()
  
  return active
    .map(({ materialId, precoPadrao }) => {
      const material = catalog.find(m => m.id === materialId)
      return material ? { material, precoPadrao } : null
    })
    .filter((item): item is { material: MaterialCatalogItem; precoPadrao: number | null } => item !== null)
}





