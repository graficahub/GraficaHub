/**
 * Utilitários para gerenciamento de materiais no localStorage
 */

export interface Material {
  id: string
  idCatalogo: string // ID do MATERIAL_CATALOG
  nome: string // Nome montado automaticamente
  categoria: string
  subcategoria: string
  acabamento: string
  precoPorM2: number
  tecnologias: string[] // Tecnologias selecionadas
  impressorasCompatíveis: string[] // IDs das impressoras compatíveis
  createdAt: string
  // Campos legados para compatibilidade
  name?: string
  pricePerM2?: number
  category?: string
  compatiblePrinters?: string[]
}

const STORAGE_MATERIALS_KEY = 'graficaHubMaterials'

export function loadMaterialsFromStorage(): Material[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_MATERIALS_KEY)
    const materials = stored ? JSON.parse(stored) : []
    
    // Migração: converter materiais antigos para novo formato
    return materials.map((material: any) => {
      // Se já está no novo formato, retorna como está
      if (material.idCatalogo && material.nome) {
        return material
      }
      
      // Migração de formato antigo para novo
      return {
        id: material.id,
        idCatalogo: material.idCatalogo || material.id || '',
        nome: material.nome || material.name || 'Material sem nome',
        categoria: material.categoria || material.category || 'Outro',
        subcategoria: material.subcategoria || 'Geral',
        acabamento: material.acabamento || 'Natural',
        precoPorM2: material.precoPorM2 || material.pricePerM2 || 0,
        tecnologias: material.tecnologias || [],
        impressorasCompatíveis: material.impressorasCompatíveis || material.compatiblePrinters || [],
        createdAt: material.createdAt || new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error('❌ Erro ao carregar materiais:', err)
    return []
  }
}

export function saveMaterialsToStorage(materials: Material[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_MATERIALS_KEY, JSON.stringify(materials))
  } catch (err) {
    console.error('❌ Erro ao salvar materiais:', err)
  }
}

export function createMaterial(materialData: Omit<Material, 'id' | 'createdAt'>): Material {
  const materials = loadMaterialsFromStorage()
  
  const newMaterial: Material = {
    ...materialData,
    id: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  
  materials.push(newMaterial)
  saveMaterialsToStorage(materials)
  
  return newMaterial
}

export function updateMaterial(materialId: string, updates: Partial<Material>): Material | null {
  const materials = loadMaterialsFromStorage()
  const index = materials.findIndex(m => m.id === materialId)
  
  if (index === -1) return null
  
  materials[index] = { ...materials[index], ...updates }
  saveMaterialsToStorage(materials)
  
  return materials[index]
}

export function deleteMaterial(materialId: string): boolean {
  const materials = loadMaterialsFromStorage()
  const filtered = materials.filter(m => m.id !== materialId)
  
  if (filtered.length === materials.length) return false
  
  saveMaterialsToStorage(filtered)
  return true
}

