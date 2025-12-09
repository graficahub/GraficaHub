import { Proposal, ProposalWithScore, ProposalContext } from '@/types/proposals'

/**
 * Normaliza um valor para o intervalo [0, 1]
 * Valores menores são melhores para esta métrica
 */
function normalizeMin(value: number, min: number, max: number): number {
  if (max === min) return 0
  return 1 - (value - min) / (max - min)
}

/**
 * Normaliza um valor para o intervalo [0, 1]
 * Valores maiores são melhores para esta métrica
 */
function normalizeMax(value: number, min: number, max: number): number {
  if (max === min) return 0
  return (value - min) / (max - min)
}

/**
 * Calcula o score de ranqueamento de uma proposta
 * 
 * Fórmula:
 * score = (precoNormalizado * 0.4) + 
 *         (distanciaNormalizada * 0.3) + 
 *         (notaNormalizada * 0.2) + 
 *         (velocidadeRespostaNormalizada * 0.1)
 * 
 * Quanto MENOR o preço/distância/tempo de resposta, melhor.
 * Quanto MAIOR a nota, melhor.
 */
export function calculateScore(
  proposal: Proposal,
  context: {
    minPreco: number
    maxPreco: number
    minDistancia: number
    maxDistancia: number
    minNota: number
    maxNota: number
    minTempoResposta: number
    maxTempoResposta: number
  }
): number {
  const precoNormalizado = normalizeMin(
    proposal.precoTotal,
    context.minPreco,
    context.maxPreco
  )

  const distanciaNormalizada = normalizeMin(
    proposal.distanciaKm,
    context.minDistancia,
    context.maxDistancia
  )

  const notaNormalizada = normalizeMax(
    proposal.notaGeral,
    context.minNota,
    context.maxNota
  )

  const velocidadeRespostaNormalizada = normalizeMin(
    proposal.tempoRespostaMinutos,
    context.minTempoResposta,
    context.maxTempoResposta
  )

  const score =
    precoNormalizado * 0.4 +
    distanciaNormalizada * 0.3 +
    notaNormalizada * 0.2 +
    velocidadeRespostaNormalizada * 0.1

  return score
}

/**
 * Ranqueia e ordena as propostas por score
 */
export function rankProposals(proposals: Proposal[]): ProposalWithScore[] {
  if (proposals.length === 0) return []

  // Calcula os valores mínimo e máximo para normalização
  const precos = proposals.map(p => p.precoTotal)
  const distancias = proposals.map(p => p.distanciaKm)
  const notas = proposals.map(p => p.notaGeral)
  const temposResposta = proposals.map(p => p.tempoRespostaMinutos)

  const context = {
    minPreco: Math.min(...precos),
    maxPreco: Math.max(...precos),
    minDistancia: Math.min(...distancias),
    maxDistancia: Math.max(...distancias),
    minNota: Math.min(...notas),
    maxNota: Math.max(...notas),
    minTempoResposta: Math.min(...temposResposta),
    maxTempoResposta: Math.max(...temposResposta),
  }

  // Calcula score para cada proposta
  const proposalsWithScore: ProposalWithScore[] = proposals.map(proposal => ({
    ...proposal,
    score: calculateScore(proposal, context),
    badges: [],
    precoStatus: 'NA_MEDIA' as const,
    precoPercentualVsMedia: 0,
  }))

  // Ordena por score (maior score = melhor)
  proposalsWithScore.sort((a, b) => b.score - a.score)

  // Calcula o preço médio da região
  const precoMedio = proposals.reduce((sum, p) => sum + p.precoTotal, 0) / proposals.length
  const precoMedioPorM2 = proposals
    .filter(p => p.precoPorM2)
    .reduce((sum, p) => sum + (p.precoPorM2 || 0), 0) / proposals.filter(p => p.precoPorM2).length

  // Atualiza status de preço vs média para cada proposta
  proposalsWithScore.forEach(proposal => {
    const precoComparacao = proposal.precoPorM2 || proposal.precoTotal
    const mediaComparacao = proposal.precoMedioRegiaoPorM2 || precoMedioPorM2 || precoMedio

    if (mediaComparacao > 0) {
      const percentual = ((precoComparacao - mediaComparacao) / mediaComparacao) * 100

      proposal.precoPercentualVsMedia = percentual

      if (percentual <= -5) {
        proposal.precoStatus = 'ABAIXO_MEDIA'
      } else if (percentual <= 5) {
        proposal.precoStatus = 'NA_MEDIA'
      } else {
        proposal.precoStatus = 'ACIMA_MEDIA'
      }
    }
  })

  return proposalsWithScore
}

/**
 * Calcula o contexto necessário para gerar badges
 */
export function calculateProposalContext(
  proposals: ProposalWithScore[]
): ProposalContext {
  if (proposals.length === 0) {
    return {
      menorDistancia: 0,
      melhorCustoBeneficioId: '',
      melhorAvaliacaoId: '',
      maisRapidaId: '',
      recomendadaId: '',
      precoMedio: 0,
    }
  }

  // Menor distância
  const menorDistancia = Math.min(...proposals.map(p => p.distanciaKm))

  // Melhor avaliação (maior nota)
  const melhorAvaliacao = proposals.reduce((best, current) =>
    current.notaGeral > best.notaGeral ? current : best
  )

  // Mais rápida (menor tempo de resposta)
  const maisRapida = proposals.reduce((fastest, current) =>
    current.tempoRespostaMinutos < fastest.tempoRespostaMinutos ? current : fastest
  )

  // Recomendada (maior score)
  const recomendada = proposals.reduce((best, current) =>
    current.score > best.score ? current : best
  )

  // Melhor custo-benefício (melhor relação preço/nota)
  const melhorCustoBeneficio = proposals.reduce((best, current) => {
    const ratioBest = best.precoTotal / best.notaGeral
    const ratioCurrent = current.precoTotal / current.notaGeral
    return ratioCurrent < ratioBest ? current : best
  })

  // Preço médio
  const precoMedio = proposals.reduce((sum, p) => sum + p.precoTotal, 0) / proposals.length

  const precoMedioPorM2 = proposals
    .filter(p => p.precoPorM2)
    .reduce((sum, p) => sum + (p.precoPorM2 || 0), 0) / proposals.filter(p => p.precoPorM2).length

  return {
    menorDistancia,
    melhorCustoBeneficioId: melhorCustoBeneficio.id,
    melhorAvaliacaoId: melhorAvaliacao.id,
    maisRapidaId: maisRapida.id,
    recomendadaId: recomendada.id,
    precoMedio,
    precoMedioPorM2,
  }
}

/**
 * Gera os badges para uma proposta baseado no contexto
 */
export function getBadgesForProposal(
  proposal: ProposalWithScore,
  context: ProposalContext
): string[] {
  const badges: string[] = []

  // Recomendado = maior score global
  if (proposal.id === context.recomendadaId) {
    badges.push('Recomendado')
  }

  // Mais próximo = menor distância
  if (proposal.distanciaKm === context.menorDistancia) {
    badges.push('Mais próximo')
  }

  // Melhor custo-benefício = melhor relação preço/nota
  if (proposal.id === context.melhorCustoBeneficioId) {
    badges.push('Melhor custo-benefício')
  }

  // Mais rápido = menor tempo de resposta
  if (proposal.id === context.maisRapidaId) {
    badges.push('Mais rápido')
  }

  // Melhor avaliada = maior nota
  if (proposal.id === context.melhorAvaliacaoId) {
    badges.push('Melhor avaliada')
  }

  // Aceita cupom
  if (proposal.aceitaCupom) {
    badges.push('Aceita cupom de R$ 50')
  }

  return badges
}

/**
 * Formata a tecnologia para exibição
 */
export function formatTechnology(tech: string): string {
  const map: Record<string, string> = {
    ECO_SOLVENTE: 'Eco-solvente',
    SOLVENTE: 'Solvente',
    UV: 'UV',
    DTF: 'DTF',
    DTF_UV: 'DTF-UV',
    SUBLIMACAO: 'Sublimação',
  }
  return map[tech] || tech
}

/**
 * Formata o tipo de entrega para exibição
 */
export function formatDeliveryType(deliveryType: string): string {
  const map: Record<string, string> = {
    RETIRADA: 'Somente retirada',
    ENTREGA_PAGA: 'Entrega paga',
    ENTREGA_GRATIS: 'Entrega grátis',
  }
  return map[deliveryType] || deliveryType
}

/**
 * Formata o nível para exibição
 */
export function formatLevel(level: string): string {
  const map: Record<string, string> = {
    BRONZE: 'Bronze',
    PRATA: 'Prata',
    OURO: 'Ouro',
  }
  return map[level] || level
}

/**
 * Retorna a cor do badge de nível
 */
export function getLevelColor(level: string): string {
  const map: Record<string, string> = {
    BRONZE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PRATA: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
    OURO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }
  return map[level] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

/**
 * Retorna a cor do status de preço
 */
export function getPrecoStatusColor(status: string): string {
  const map: Record<string, string> = {
    ABAIXO_MEDIA: 'text-green-400',
    NA_MEDIA: 'text-yellow-400',
    ACIMA_MEDIA: 'text-red-400',
  }
  return map[status] || 'text-slate-400'
}


