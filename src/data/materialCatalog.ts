/**
 * Catálogo de materiais pré-definidos
 * Estrutura: Categoria → Subcategoria → Acabamento
 * 
 * NOTA: Este arquivo contém apenas os valores padrão.
 * O catálogo real é gerenciado via localStorage através de materialCatalogStorage.ts
 */

export interface MaterialCatalogItem {
  id: string
  categoria: string
  subcategoria: string
  acabamento: string
  tecnologias: string[]
}

export const MATERIAL_CATALOG: MaterialCatalogItem[] = [
  // ========== LONAS ==========
  {
    id: 'lona-front-440-brilho',
    categoria: 'Lona',
    subcategoria: 'Frontlight 440g',
    acabamento: 'Brilho',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'lona-front-440-fosco',
    categoria: 'Lona',
    subcategoria: 'Frontlight 440g',
    acabamento: 'Fosco',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'lona-front-520-brilho',
    categoria: 'Lona',
    subcategoria: 'Frontlight 520g',
    acabamento: 'Brilho',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'lona-front-520-fosco',
    categoria: 'Lona',
    subcategoria: 'Frontlight 520g',
    acabamento: 'Fosco',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'lona-back-550',
    categoria: 'Lona',
    subcategoria: 'Backlight 550g',
    acabamento: 'Translúcido',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV'],
  },
  {
    id: 'lona-back-600',
    categoria: 'Lona',
    subcategoria: 'Backlight 600g',
    acabamento: 'Translúcido',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV'],
  },
  {
    id: 'lona-blackout-440',
    categoria: 'Lona',
    subcategoria: 'Blackout 440g',
    acabamento: 'Fosco',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'lona-mesh-440',
    categoria: 'Lona',
    subcategoria: 'Mesh 440g',
    acabamento: 'Translúcido',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV'],
  },

  // ========== ADESIVOS ==========
  {
    id: 'adesivo-vinil-brilho',
    categoria: 'Adesivo',
    subcategoria: 'Vinil',
    acabamento: 'Brilho',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'adesivo-vinil-fosco',
    categoria: 'Adesivo',
    subcategoria: 'Vinil',
    acabamento: 'Fosco',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'adesivo-transparente',
    categoria: 'Adesivo',
    subcategoria: 'Transparente',
    acabamento: 'Transparente',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'adesivo-espelhado',
    categoria: 'Adesivo',
    subcategoria: 'Espelhado',
    acabamento: 'Espelhado',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV'],
  },
  {
    id: 'adesivo-perfurado',
    categoria: 'Adesivo',
    subcategoria: 'Perfurado',
    acabamento: 'Perfurado',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },
  {
    id: 'adesivo-blackout',
    categoria: 'Adesivo',
    subcategoria: 'Blackout',
    acabamento: 'Fosco',
    tecnologias: ['Solvente', 'Eco-solvente', 'UV', 'Latex'],
  },

  // ========== TECIDOS ==========
  {
    id: 'tecido-poliester',
    categoria: 'Tecido',
    subcategoria: 'Poliéster',
    acabamento: 'Natural',
    tecnologias: ['Sublimação', 'DTF Têxtil', 'DTF-UV'],
  },
  {
    id: 'tecido-canvas',
    categoria: 'Tecido',
    subcategoria: 'Canvas',
    acabamento: 'Natural',
    tecnologias: ['Sublimação', 'DTF Têxtil'],
  },
  {
    id: 'tecido-lienzo',
    categoria: 'Tecido',
    subcategoria: 'Lienzo',
    acabamento: 'Natural',
    tecnologias: ['Sublimação', 'DTF Têxtil'],
  },
  {
    id: 'tecido-mesh',
    categoria: 'Tecido',
    subcategoria: 'Mesh',
    acabamento: 'Translúcido',
    tecnologias: ['Sublimação', 'DTF Têxtil'],
  },

  // ========== PAPÉIS ==========
  {
    id: 'papel-fotografico-240',
    categoria: 'Papel',
    subcategoria: 'Fotográfico 240g',
    acabamento: 'Brilho',
    tecnologias: ['Sublimação'],
  },
  {
    id: 'papel-fotografico-300',
    categoria: 'Papel',
    subcategoria: 'Fotográfico 300g',
    acabamento: 'Brilho',
    tecnologias: ['Sublimação'],
  },
  {
    id: 'papel-couche-150',
    categoria: 'Papel',
    subcategoria: 'Couchê 150g',
    acabamento: 'Brilho',
    tecnologias: ['UV', 'Latex'],
  },
  {
    id: 'papel-couche-200',
    categoria: 'Papel',
    subcategoria: 'Couchê 200g',
    acabamento: 'Brilho',
    tecnologias: ['UV', 'Latex'],
  },
  {
    id: 'papel-couche-300',
    categoria: 'Papel',
    subcategoria: 'Couchê 300g',
    acabamento: 'Brilho',
    tecnologias: ['UV', 'Latex'],
  },

  // ========== PLACAS RÍGIDAS ==========
  {
    id: 'placa-ps-3mm',
    categoria: 'Placa Rígida',
    subcategoria: 'PS 3mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-ps-5mm',
    categoria: 'Placa Rígida',
    subcategoria: 'PS 5mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-acm-3mm',
    categoria: 'Placa Rígida',
    subcategoria: 'ACM 3mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-acm-4mm',
    categoria: 'Placa Rígida',
    subcategoria: 'ACM 4mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-pvc-3mm',
    categoria: 'Placa Rígida',
    subcategoria: 'PVC 3mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-pvc-5mm',
    categoria: 'Placa Rígida',
    subcategoria: 'PVC 5mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-acrilico-3mm',
    categoria: 'Placa Rígida',
    subcategoria: 'Acrílico 3mm',
    acabamento: 'Transparente',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-acrilico-5mm',
    categoria: 'Placa Rígida',
    subcategoria: 'Acrílico 5mm',
    acabamento: 'Transparente',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-mdf-3mm',
    categoria: 'Placa Rígida',
    subcategoria: 'MDF 3mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
  {
    id: 'placa-mdf-6mm',
    categoria: 'Placa Rígida',
    subcategoria: 'MDF 6mm',
    acabamento: 'Natural',
    tecnologias: ['UV'],
  },
]

/**
 * Obtém todas as categorias únicas do catálogo
 */
export function getCategorias(): string[] {
  const categorias = new Set<string>()
  MATERIAL_CATALOG.forEach((item) => categorias.add(item.categoria))
  return Array.from(categorias).sort()
}

/**
 * Obtém todas as subcategorias de uma categoria específica
 */
export function getSubcategorias(categoria: string): string[] {
  const subcategorias = new Set<string>()
  MATERIAL_CATALOG.filter((item) => item.categoria === categoria).forEach((item) =>
    subcategorias.add(item.subcategoria)
  )
  return Array.from(subcategorias).sort()
}

/**
 * Obtém todos os acabamentos de uma categoria e subcategoria específicas
 */
export function getAcabamentos(categoria: string, subcategoria: string): string[] {
  const acabamentos = new Set<string>()
  MATERIAL_CATALOG.filter(
    (item) => item.categoria === categoria && item.subcategoria === subcategoria
  ).forEach((item) => acabamentos.add(item.acabamento))
  return Array.from(acabamentos).sort()
}

/**
 * Encontra um item do catálogo por categoria, subcategoria e acabamento
 */
export function findCatalogItem(
  categoria: string,
  subcategoria: string,
  acabamento: string
): MaterialCatalogItem | undefined {
  return MATERIAL_CATALOG.find(
    (item) =>
      item.categoria === categoria &&
      item.subcategoria === subcategoria &&
      item.acabamento === acabamento
  )
}

/**
 * Gera o nome do material a partir da combinação
 */
export function generateMaterialName(categoria: string, subcategoria: string, acabamento: string): string {
  return `${categoria} – ${subcategoria} – ${acabamento}`
}

