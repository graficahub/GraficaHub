export type DeliveryType = 'RETIRADA' | 'ENTREGA_PAGA' | 'ENTREGA_GRATIS'

export type Technology =
  | 'ECO_SOLVENTE'
  | 'SOLVENTE'
  | 'UV'
  | 'DTF'
  | 'DTF_UV'
  | 'SUBLIMACAO'

export type Level = 'BRONZE' | 'PRATA' | 'OURO'

export interface Proposal {
  id: string
  pedidoId: string
  // NÃO mostrar o nome da gráfica aqui na UI, só usar internamente
  graficaId: string
  graficaNomeReal: string
  distanciaKm: number
  notaGeral: number // média 0–5
  notaPrazo?: number // opcional
  notaQualidade?: number // opcional
  notaAtendimento?: number // opcional
  nivel: Level // bronze/prata/ouro
  precoTotal: number // preço da proposta
  precoPorM2?: number // opcional
  precoMedioRegiaoPorM2?: number // opcional
  tecnologia: Technology
  tempoMedioProducaoHoras: number
  historicoNaCategoria: number // quantidade de pedidos concluídos desse tipo
  deliveryType: DeliveryType
  aceitaCupom: boolean
  tempoRespostaMinutos: number
  // campos derivados podem ser calculados: abaixo/na média/acima da média etc.
}

export interface ProposalWithScore extends Proposal {
  score: number
  badges: string[]
  precoStatus: 'ABAIXO_MEDIA' | 'NA_MEDIA' | 'ACIMA_MEDIA'
  precoPercentualVsMedia: number
}

export interface ProposalContext {
  menorDistancia: number
  melhorCustoBeneficioId: string
  melhorAvaliacaoId: string
  maisRapidaId: string
  recomendadaId: string
  precoMedio: number
  precoMedioPorM2?: number
}


