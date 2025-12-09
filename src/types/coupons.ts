/**
 * Tipos para sistema de cupons
 */

export type CouponType = 'valor_fixo' | 'percentual' | 'credito' | 'frete_gratis'
export type CouponScope = 'todos' | 'usuarios' | 'tags'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number // R$ ou % dependendo do type
  scope: CouponScope
  userIds?: string[] // se scope === 'usuarios'
  tags?: string[] // se scope === 'tags'
  minOrderValue?: number
  maxUsesTotal?: number
  maxUsesPerUser?: number
  startsAt?: string // ISO date
  endsAt?: string // ISO date
  active: boolean
  createdAt: string
}

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  valor_fixo: 'Valor fixo em R$',
  percentual: 'Percentual (%)',
  credito: 'Crédito em carteira',
  frete_gratis: 'Frete grátis',
}

export const COUPON_SCOPE_LABELS: Record<CouponScope, string> = {
  todos: 'Todos os usuários',
  usuarios: 'Usuários específicos',
  tags: 'Tags de usuário',
}



