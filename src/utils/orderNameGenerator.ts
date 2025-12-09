/**
 * Funções utilitárias para gerar nomes de pedidos automaticamente
 * Atualizado para trabalhar com a nova estrutura baseada em Tecnologia
 */

import { Tecnologia, getMaterialByTecnologia } from '@/config/tecnologiasMateriais'

interface GenerateOrderNameParams {
  tecnologia: Tecnologia
  materialId: string
  caracteristicaId?: string
  width?: string
  height?: string
  quantity?: number
}

/**
 * Gera o nome do pedido automaticamente com base nas escolhas
 * 
 * Formato sugerido:
 * - Com tamanho e quantidade: "Lona 440g 3m x 2m (2 un)"
 * - Com característica: "Adesivo Vinil - Brilho 1m x 0,5m"
 * - Sem tamanho: "Banner 510g (3 un)"
 */
export function generateOrderName(params: GenerateOrderNameParams): string {
  const { tecnologia, materialId, caracteristicaId, width, height, quantity } = params

  // Busca o material
  const material = getMaterialByTecnologia(tecnologia, materialId)
  if (!material) {
    return 'Pedido sem material'
  }

  // Inicia com o nome do material
  let nome = material.label

  // Adiciona característica se existir
  if (caracteristicaId && material.caracteristicas) {
    const caracteristica = material.caracteristicas.find(c => c.id === caracteristicaId)
    if (caracteristica) {
      nome += ` - ${caracteristica.label}`
    }
  }

  // Adiciona dimensões se existirem
  if (width && height) {
    // Normaliza o formato das dimensões
    const larguraFormatada = normalizeDimension(width)
    const alturaFormatada = normalizeDimension(height)
    nome += ` ${larguraFormatada} x ${alturaFormatada}`
  } else if (width) {
    // Se só tiver largura
    const larguraFormatada = normalizeDimension(width)
    nome += ` ${larguraFormatada}`
  }

  // Adiciona quantidade se for maior que 1
  if (quantity && quantity > 1) {
    nome += ` (${quantity} un)`
  }

  return nome
}

/**
 * Normaliza o formato da dimensão para exibição consistente
 * Exemplos:
 * - "3m" -> "3m"
 * - "300cm" -> "3m"
 * - "3,5m" -> "3,5m"
 * - "1.5m" -> "1,5m"
 */
function normalizeDimension(dimension: string): string {
  if (!dimension) return ''

  const trimmed = dimension.trim()

  // Se já termina com "m", retorna como está (removendo espaços extras)
  if (trimmed.endsWith('m')) {
    return trimmed.replace(/\s+/g, '').replace(/\./g, ',')
  }

  // Se termina com "cm", converte para metros
  if (trimmed.endsWith('cm')) {
    const value = parseFloat(trimmed.replace('cm', '').trim())
    if (!isNaN(value)) {
      const metros = value / 100
      // Formata para 1 casa decimal se necessário
      if (metros % 1 === 0) {
        return `${metros}m`
      } else {
        return `${metros.toFixed(1).replace('.', ',')}m`
      }
    }
  }

  // Se for apenas número, assume que está em cm e converte
  const numericValue = parseFloat(trimmed)
  if (!isNaN(numericValue) && numericValue > 0) {
    // Se for um número grande, provavelmente está em cm
    if (numericValue > 10) {
      const metros = numericValue / 100
      if (metros % 1 === 0) {
        return `${metros}m`
      } else {
        return `${metros.toFixed(1).replace('.', ',')}m`
      }
    } else {
      // Se for pequeno, provavelmente já está em metros
      return `${numericValue.toString().replace('.', ',')}m`
    }
  }

  // Retorna como está se não conseguir normalizar
  return trimmed
}

/**
 * Gera uma descrição curta do pedido (opcional)
 */
export function generateOrderDescription(params: GenerateOrderNameParams): string {
  const { tecnologia, materialId } = params
  const material = getMaterialByTecnologia(tecnologia, materialId)
  
  if (!material || !material.descricaoCurta) {
    return ''
  }

  return material.descricaoCurta
}
