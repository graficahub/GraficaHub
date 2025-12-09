/**
 * Utilitários para gerenciamento do catálogo de materiais no localStorage
 * Agora usa o sistema de rascunho vs publicado
 */

import { MaterialCatalogItem, MATERIAL_CATALOG } from '@/data/materialCatalog'
import { loadData, saveData, isPreviewMode, markAsDirty } from './adminData'
import { isAdmin } from './admin'

const CATALOG_BASE_KEY = 'MATERIAL_CATALOG'
const TECHNOLOGIES_BASE_KEY = 'MATERIAL_TECHNOLOGIES'

const DEFAULT_TECHNOLOGIES = [
  'UV',
  'Solvente',
  'Eco-solvente',
  'Sublimação',
  'DTF Têxtil',
  'DTF-UV',
  'Latex',
]

/**
 * Carrega o catálogo baseado no contexto (published para users, draft para admin)
 */
export function loadMaterialCatalog(): MaterialCatalogItem[] {
  const isAdminMode = isAdmin()
  return loadData<MaterialCatalogItem[]>(CATALOG_BASE_KEY, MATERIAL_CATALOG, isAdminMode)
}

/**
 * Salva o catálogo (sempre em draft se for admin)
 */
export function saveMaterialCatalog(catalog: MaterialCatalogItem[]): void {
  const isAdminMode = isAdmin()
  saveData(CATALOG_BASE_KEY, catalog, isAdminMode)
}

/**
 * Adiciona um item ao catálogo
 */
export function addCatalogItem(item: Omit<MaterialCatalogItem, 'id'>): MaterialCatalogItem {
  const catalog = loadMaterialCatalog()
  const newItem: MaterialCatalogItem = {
    ...item,
    id: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
  catalog.push(newItem)
  saveMaterialCatalog(catalog)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return newItem
}

/**
 * Atualiza um item do catálogo
 */
export function updateCatalogItem(id: string, updates: Partial<MaterialCatalogItem>): MaterialCatalogItem | null {
  const catalog = loadMaterialCatalog()
  const index = catalog.findIndex((item) => item.id === id)
  
  if (index === -1) return null
  
  catalog[index] = { ...catalog[index], ...updates }
  saveMaterialCatalog(catalog)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return catalog[index]
}

/**
 * Remove um item do catálogo
 */
export function deleteCatalogItem(id: string): boolean {
  const catalog = loadMaterialCatalog()
  const filtered = catalog.filter((item) => item.id !== id)
  
  if (filtered.length === catalog.length) return false
  
  saveMaterialCatalog(filtered)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return true
}

/**
 * Carrega as tecnologias baseado no contexto
 */
export function loadTechnologies(): string[] {
  const isAdminMode = isAdmin()
  return loadData<string[]>(TECHNOLOGIES_BASE_KEY, DEFAULT_TECHNOLOGIES, isAdminMode)
}

/**
 * Salva as tecnologias (sempre em draft se for admin)
 */
export function saveTechnologies(technologies: string[]): void {
  const isAdminMode = isAdmin()
  saveData(TECHNOLOGIES_BASE_KEY, technologies, isAdminMode)
}

/**
 * Adiciona uma nova tecnologia
 */
export function addTechnology(technology: string): void {
  const technologies = loadTechnologies()
  if (!technologies.includes(technology)) {
    technologies.push(technology)
    saveTechnologies(technologies)
    // Marca como dirty se for admin
    if (isAdmin()) {
      markAsDirty()
    }
  }
}

