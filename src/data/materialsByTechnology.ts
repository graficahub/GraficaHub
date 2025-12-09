/**
 * Estrutura de dados baseada em Tecnologia primeiro
 * Define quais materiais estão disponíveis para cada tecnologia
 */

export type Tecnologia =
  | 'UV'
  | 'SOLVENTE_ECOSOLVENTE'
  | 'SUBLIMACAO'
  | 'DTF_TEXTIL'
  | 'DTF_UV'

export type CategoriaMaterialBase =
  | 'LONA'
  | 'ADESIVO'
  | 'PAPEL_FOTOGRAFICO'
  | 'RIGIDOS'
  | 'PAPEL_SUBLIMATICO'
  | 'TECIDO'

export interface CaracteristicaOpcao {
  id: string
  label: string
}

export interface MaterialConfig {
  id: string
  categoria: CategoriaMaterialBase
  label: string
  descricaoCurta?: string
  caracteristicas?: CaracteristicaOpcao[]
}

export interface TecnologiaConfig {
  tecnologia: Tecnologia
  materiais: MaterialConfig[]
}

/**
 * Mapeamento de labels para tecnologias (para exibição)
 */
export function getTecnologiaLabel(tecnologia: Tecnologia): string {
  const labels: Record<Tecnologia, string> = {
    UV: 'UV',
    SOLVENTE_ECOSOLVENTE: 'Solvente/EcoSolvente',
    SUBLIMACAO: 'Sublimação',
    DTF_TEXTIL: 'DTF Têxtil',
    DTF_UV: 'DTF-UV',
  }
  return labels[tecnologia] || tecnologia
}

/**
 * Configuração completa de todas as tecnologias e seus materiais
 */
export const TECNOLOGIAS_CONFIG: TecnologiaConfig[] = [
  {
    tecnologia: 'UV',
    materiais: [
      {
        id: 'acm-3mm',
        categoria: 'RIGIDOS',
        label: 'ACM 3mm',
        descricaoCurta: 'Rígido',
      },
      {
        id: 'acm-4mm',
        categoria: 'RIGIDOS',
        label: 'ACM 4mm',
        descricaoCurta: 'Rígido',
      },
      {
        id: 'pvc-espumado-3mm',
        categoria: 'RIGIDOS',
        label: 'PVC Espumado 3mm',
        descricaoCurta: 'Rígido',
      },
      {
        id: 'pvc-espumado-5mm',
        categoria: 'RIGIDOS',
        label: 'PVC Espumado 5mm',
        descricaoCurta: 'Rígido',
      },
      {
        id: 'mdf',
        categoria: 'RIGIDOS',
        label: 'MDF',
        descricaoCurta: 'Rígido',
      },
      {
        id: 'vidro',
        categoria: 'RIGIDOS',
        label: 'Vidro',
        descricaoCurta: 'Rígido',
        caracteristicas: [
          { id: 'impressao-uv-direta', label: 'Impressão UV direta' },
          { id: 'adesivado', label: 'Adesivado' },
        ],
      },
    ],
  },
  {
    tecnologia: 'SOLVENTE_ECOSOLVENTE',
    materiais: [
      {
        id: 'lona-440g',
        categoria: 'LONA',
        label: 'Lona 440g',
        descricaoCurta: 'Lona padrão',
        caracteristicas: [
          { id: 'comum', label: 'Comum' },
          { id: 'para-banner', label: 'Para banner' },
        ],
      },
      {
        id: 'lona-520g',
        categoria: 'LONA',
        label: 'Lona 520g',
        descricaoCurta: 'Lona reforçada',
        caracteristicas: [
          { id: 'comum', label: 'Comum' },
          { id: 'para-banner', label: 'Para banner' },
        ],
      },
      {
        id: 'lona-600g',
        categoria: 'LONA',
        label: 'Lona 600g',
        descricaoCurta: 'Lona extra reforçada',
        caracteristicas: [
          { id: 'comum', label: 'Comum' },
          { id: 'para-banner', label: 'Para banner' },
        ],
      },
      {
        id: 'lona-frontlit',
        categoria: 'LONA',
        label: 'Lona Frontlit',
        descricaoCurta: 'Para iluminação frontal',
      },
      {
        id: 'lona-backlit',
        categoria: 'LONA',
        label: 'Lona Backlit',
        descricaoCurta: 'Para iluminação traseira',
      },
      {
        id: 'adesivo-vinil',
        categoria: 'ADESIVO',
        label: 'Adesivo Vinil',
        descricaoCurta: 'Adesivo padrão',
        caracteristicas: [
          { id: 'brilho', label: 'Brilho' },
          { id: 'fosco', label: 'Fosco' },
          { id: 'transparente', label: 'Transparente' },
        ],
      },
      {
        id: 'adesivo-espelhado',
        categoria: 'ADESIVO',
        label: 'Adesivo Espelhado',
        descricaoCurta: 'Efeito espelho',
      },
      {
        id: 'adesivo-blackout',
        categoria: 'ADESIVO',
        label: 'Adesivo Blackout',
        descricaoCurta: 'Opaco',
        caracteristicas: [
          { id: 'preto', label: 'Preto' },
          { id: 'branco', label: 'Branco' },
        ],
      },
      {
        id: 'adesivo-perfurado',
        categoria: 'ADESIVO',
        label: 'Adesivo Perfurado',
        descricaoCurta: 'Para vidros',
        caracteristicas: [
          { id: 'perfurado-010', label: 'Perfurado 0,10mm' },
          { id: 'perfurado-020', label: 'Perfurado 0,20mm' },
          { id: 'perfurado-030', label: 'Perfurado 0,30mm' },
        ],
      },
      {
        id: 'banner-280g',
        categoria: 'LONA',
        label: 'Banner 280g',
        descricaoCurta: 'Banner leve',
      },
      {
        id: 'banner-440g',
        categoria: 'LONA',
        label: 'Banner 440g',
        descricaoCurta: 'Banner padrão',
      },
      {
        id: 'banner-510g',
        categoria: 'LONA',
        label: 'Banner 510g',
        descricaoCurta: 'Banner reforçado',
      },
    ],
  },
  {
    tecnologia: 'SUBLIMACAO',
    materiais: [],
  },
  {
    tecnologia: 'DTF_TEXTIL',
    materiais: [],
  },
  {
    tecnologia: 'DTF_UV',
    materiais: [],
  },
]

/**
 * Busca a configuração de uma tecnologia
 */
export function getTecnologiaConfig(tecnologia: Tecnologia): TecnologiaConfig | undefined {
  return TECNOLOGIAS_CONFIG.find(t => t.tecnologia === tecnologia)
}

/**
 * Busca materiais disponíveis para uma tecnologia
 */
export function getMateriaisByTecnologia(tecnologia: Tecnologia): MaterialConfig[] {
  const config = getTecnologiaConfig(tecnologia)
  return config?.materiais || []
}

/**
 * Busca um material específico dentro de uma tecnologia
 */
export function getMaterialByTecnologia(
  tecnologia: Tecnologia,
  materialId: string
): MaterialConfig | undefined {
  const materiais = getMateriaisByTecnologia(tecnologia)
  return materiais.find(m => m.id === materialId)
}

/**
 * Retorna todas as tecnologias disponíveis
 */
export function getAllTecnologias(): TecnologiaConfig[] {
  return TECNOLOGIAS_CONFIG
}
