export type Tecnologia =
  | "UV"
  | "SOLVENTE_ECOSOLVENTE"
  | "SUBLIMACAO"
  | "DTF_TEXTIL"
  | "DTF_UV"

export type CategoriaMaterialBase =
  | "LONA"
  | "ADESIVO"
  | "PAPEL_FOTOGRAFICO"
  | "RIGIDOS"
  | "PAPEL_SUBLIMATICO"
  | "TECIDO"

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

export const TECNOLOGIAS_MATERIAIS: TecnologiaConfig[] = [
  {
    tecnologia: "UV",
    materiais: [
      // LONA
      { id: "uv_lona_280", categoria: "LONA", label: "Lona 280g UV" },
      { id: "uv_lona_340", categoria: "LONA", label: "Lona 340g UV" },
      { id: "uv_lona_440", categoria: "LONA", label: "Lona 440g UV" },
      { id: "uv_lona_510", categoria: "LONA", label: "Lona 510g UV" },

      // ADESIVO
      { id: "uv_adesivo_branco_brilho", categoria: "ADESIVO", label: "Adesivo vinil branco brilho UV" },
      { id: "uv_adesivo_branco_fosco", categoria: "ADESIVO", label: "Adesivo vinil branco fosco UV" },
      { id: "uv_adesivo_transparente", categoria: "ADESIVO", label: "Adesivo vinil transparente UV" },
      { id: "uv_adesivo_jateado", categoria: "ADESIVO", label: "Adesivo jateado UV" },

      // PAPEL FOTOGRÁFICO
      { id: "uv_papel_foto_180", categoria: "PAPEL_FOTOGRAFICO", label: "Papel fotográfico 180g UV" },
      { id: "uv_papel_foto_230", categoria: "PAPEL_FOTOGRAFICO", label: "Papel fotográfico 230g UV" },

      // RÍGIDOS (impressão direta UV)
      { id: "uv_ps_1mm", categoria: "RIGIDOS", label: "PS 1mm UV" },
      { id: "uv_ps_2mm", categoria: "RIGIDOS", label: "PS 2mm UV" },
      { id: "uv_ps_3mm", categoria: "RIGIDOS", label: "PS 3mm UV" },
      { id: "uv_ps_5mm", categoria: "RIGIDOS", label: "PS 5mm UV" },
      { id: "uv_poliondas_3mm", categoria: "RIGIDOS", label: "Poliondas 3mm UV" },
      { id: "uv_poliondas_5mm", categoria: "RIGIDOS", label: "Poliondas 5mm UV" },
    ],
  },
  {
    tecnologia: "SOLVENTE_ECOSOLVENTE",
    materiais: [
      // LONA
      { id: "solv_lona_280", categoria: "LONA", label: "Lona 280g (Eco/Solvente)" },
      { id: "solv_lona_340", categoria: "LONA", label: "Lona 340g (Eco/Solvente)" },
      { id: "solv_lona_440", categoria: "LONA", label: "Lona 440g (Eco/Solvente)" },
      { id: "solv_lona_510", categoria: "LONA", label: "Lona 510g (Eco/Solvente)" },

      // ADESIVO
      { id: "solv_vinil_branco_brilho", categoria: "ADESIVO", label: "Vinil branco brilho (Eco/Solvente)" },
      { id: "solv_vinil_branco_fosco", categoria: "ADESIVO", label: "Vinil branco fosco (Eco/Solvente)" },
      { id: "solv_vinil_transparente", categoria: "ADESIVO", label: "Vinil transparente" },
      { id: "solv_vinil_perfurado", categoria: "ADESIVO", label: "Vinil perfurado" },
      { id: "solv_vinil_blackout", categoria: "ADESIVO", label: "Vinil blackout" },

      // PAPEL FOTOGRÁFICO
      { id: "solv_papel_foto_180", categoria: "PAPEL_FOTOGRAFICO", label: "Papel fotográfico 180g" },
      { id: "solv_papel_foto_210", categoria: "PAPEL_FOTOGRAFICO", label: "Papel fotográfico 210g" },
      { id: "solv_papel_foto_230", categoria: "PAPEL_FOTOGRAFICO", label: "Papel fotográfico 230g" },

      // RIGIDOS (ADESIVADOS)
      { id: "solv_ps_1mm_adesivado", categoria: "RIGIDOS", label: "PS 1mm (com adesivo aplicado)" },
      { id: "solv_ps_2mm_adesivado", categoria: "RIGIDOS", label: "PS 2mm (com adesivo aplicado)" },
      { id: "solv_ps_3mm_adesivado", categoria: "RIGIDOS", label: "PS 3mm (com adesivo aplicado)" },
      { id: "solv_poliondas_3mm_adesivado", categoria: "RIGIDOS", label: "Poliondas 3mm (adesivado)" },
      { id: "solv_poliondas_5mm_adesivado", categoria: "RIGIDOS", label: "Poliondas 5mm (adesivado)" },
    ],
  },
  {
    tecnologia: "SUBLIMACAO",
    materiais: [
      // PAPEL SUBLIMÁTICO
      { id: "subl_papel_90g", categoria: "PAPEL_SUBLIMATICO", label: "Papel sublimático 90g" },
      { id: "subl_papel_100g", categoria: "PAPEL_SUBLIMATICO", label: "Papel sublimático 100g" },

      // TECIDOS
      { id: "subl_oxford", categoria: "TECIDO", label: "Oxford sublimado" },
      { id: "subl_helanca", categoria: "TECIDO", label: "Helanca sublimada" },
      { id: "subl_microfibra", categoria: "TECIDO", label: "Microfibra sublimada" },
      { id: "subl_bandeira", categoria: "TECIDO", label: "Tecidos para bandeira" },

      // CAMISETAS (representadas como tecido)
      { id: "subl_camiseta_poliester", categoria: "TECIDO", label: "Camiseta poliéster" },
    ],
  },
  {
    tecnologia: "DTF_TEXTIL",
    materiais: [
      { id: "dtf_textil_30cm", categoria: "TECIDO", label: "DTF têxtil 30cm de largura" },
      { id: "dtf_textil_60cm", categoria: "TECIDO", label: "DTF têxtil 60cm de largura" },
    ],
  },
  {
    tecnologia: "DTF_UV",
    materiais: [
      { id: "dtf_uv_30cm", categoria: "RIGIDOS", label: "DTF UV 30cm de largura" },
      { id: "dtf_uv_60cm", categoria: "RIGIDOS", label: "DTF UV 60cm de largura" },
    ],
  },
]

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
 * Busca a configuração de uma tecnologia
 */
export function getTecnologiaConfig(tecnologia: Tecnologia): TecnologiaConfig | undefined {
  return TECNOLOGIAS_MATERIAIS.find(t => t.tecnologia === tecnologia)
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
  return TECNOLOGIAS_MATERIAIS
}

