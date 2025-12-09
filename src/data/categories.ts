/**
 * Estrutura de dados para categorias, materiais e subtipos
 * Define quais materiais são disponíveis para cada categoria
 */

export type CategoriaBase =
  | 'ADESIVO'
  | 'LONA'
  | 'BANNER'
  | 'PAPEL_FOTOGRAFICO'
  | 'TECIDO_POLIESTER'
  | 'RIGIDOS'
  | 'OUTRO'

export interface Subtipo {
  id: string
  nome: string // ex: "Brilho", "Fosco", "Blackout", "Perfurado 0,10mm"
}

export interface MaterialCadastro {
  id: string
  nomeExibicao: string // o que aparece no select
  descricaoCurta?: string // ex: "EcoSolvente/Solvente", tecnologia, etc
  subtipoOpcional?: Subtipo[] // para acabamentos quando fizer sentido
}

export interface CategoriaConfig {
  id: CategoriaBase
  label: string // Label para exibição
  materiais: MaterialCadastro[]
}

/**
 * Configuração completa de todas as categorias e seus materiais
 */
export const CATEGORIAS_CONFIG: CategoriaConfig[] = [
  {
    id: 'ADESIVO',
    label: 'Adesivo',
    materiais: [
      {
        id: 'adesivo-vinil',
        nomeExibicao: 'Adesivo Vinil',
        descricaoCurta: 'EcoSolvente/Solvente',
        subtipoOpcional: [
          { id: 'brilho', nome: 'Brilho' },
          { id: 'fosco', nome: 'Fosco' },
          { id: 'transparente', nome: 'Transparente' },
        ],
      },
      {
        id: 'adesivo-espelhado',
        nomeExibicao: 'Adesivo Espelhado',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'adesivo-blackout',
        nomeExibicao: 'Adesivo Blackout',
        descricaoCurta: 'EcoSolvente/Solvente',
        subtipoOpcional: [
          { id: 'preto', nome: 'Preto' },
          { id: 'branco', nome: 'Branco' },
        ],
      },
      {
        id: 'adesivo-perfurado',
        nomeExibicao: 'Adesivo Perfurado',
        descricaoCurta: 'EcoSolvente/Solvente',
        subtipoOpcional: [
          { id: 'perfurado-010', nome: 'Perfurado 0,10mm' },
          { id: 'perfurado-020', nome: 'Perfurado 0,20mm' },
          { id: 'perfurado-030', nome: 'Perfurado 0,30mm' },
        ],
      },
    ],
  },
  {
    id: 'LONA',
    label: 'Lona',
    materiais: [
      {
        id: 'lona-440g',
        nomeExibicao: 'Lona 440g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'lona-520g',
        nomeExibicao: 'Lona 520g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'lona-600g',
        nomeExibicao: 'Lona 600g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'lona-frontlit',
        nomeExibicao: 'Lona Frontlit',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'lona-backlit',
        nomeExibicao: 'Lona Backlit',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
    ],
  },
  {
    id: 'BANNER',
    label: 'Banner',
    materiais: [
      {
        id: 'banner-510g',
        nomeExibicao: 'Banner 510g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'banner-440g',
        nomeExibicao: 'Banner 440g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
      {
        id: 'banner-280g',
        nomeExibicao: 'Banner 280g',
        descricaoCurta: 'EcoSolvente/Solvente',
      },
    ],
  },
  {
    id: 'PAPEL_FOTOGRAFICO',
    label: 'Papel Fotográfico',
    materiais: [
      {
        id: 'papel-fotografico-240g',
        nomeExibicao: 'Papel Fotográfico 240g',
        descricaoCurta: 'Sublimação',
        subtipoOpcional: [
          { id: 'brilho', nome: 'Brilho' },
          { id: 'fosco', nome: 'Fosco' },
          { id: 'seda', nome: 'Seda' },
        ],
      },
      {
        id: 'papel-fotografico-300g',
        nomeExibicao: 'Papel Fotográfico 300g',
        descricaoCurta: 'Sublimação',
        subtipoOpcional: [
          { id: 'brilho', nome: 'Brilho' },
          { id: 'fosco', nome: 'Fosco' },
        ],
      },
    ],
  },
  {
    id: 'TECIDO_POLIESTER',
    label: 'Tecido Poliéster',
    materiais: [
      {
        id: 'tecido-poliester',
        nomeExibicao: 'Tecido Poliéster',
        descricaoCurta: 'Sublimação',
      },
      {
        id: 'tecido-lienzo',
        nomeExibicao: 'Tecido Lienzo',
        descricaoCurta: 'Sublimação',
      },
      {
        id: 'tecido-mesh',
        nomeExibicao: 'Tecido Mesh',
        descricaoCurta: 'Sublimação',
      },
    ],
  },
  {
    id: 'RIGIDOS',
    label: 'Rígidos',
    materiais: [
      {
        id: 'acm-3mm',
        nomeExibicao: 'ACM 3mm',
        descricaoCurta: 'UV',
      },
      {
        id: 'acm-4mm',
        nomeExibicao: 'ACM 4mm',
        descricaoCurta: 'UV',
      },
      {
        id: 'pvc-espumado-3mm',
        nomeExibicao: 'PVC Espumado 3mm',
        descricaoCurta: 'UV',
      },
      {
        id: 'pvc-espumado-5mm',
        nomeExibicao: 'PVC Espumado 5mm',
        descricaoCurta: 'UV',
      },
      {
        id: 'mdf',
        nomeExibicao: 'MDF',
        descricaoCurta: 'UV',
      },
    ],
  },
  {
    id: 'OUTRO',
    label: 'Outro',
    materiais: [
      {
        id: 'outro-personalizado',
        nomeExibicao: 'Material Personalizado',
        descricaoCurta: 'Especificar na descrição',
      },
    ],
  },
]

/**
 * Busca a configuração de uma categoria pelo ID
 */
export function getCategoriaConfig(categoriaId: CategoriaBase): CategoriaConfig | undefined {
  return CATEGORIAS_CONFIG.find(cat => cat.id === categoriaId)
}

/**
 * Busca materiais disponíveis para uma categoria
 */
export function getMateriaisByCategoria(categoriaId: CategoriaBase): MaterialCadastro[] {
  const categoria = getCategoriaConfig(categoriaId)
  return categoria?.materiais || []
}

/**
 * Busca um material específico
 */
export function getMaterialById(
  categoriaId: CategoriaBase,
  materialId: string
): MaterialCadastro | undefined {
  const materiais = getMateriaisByCategoria(categoriaId)
  return materiais.find(m => m.id === materialId)
}


