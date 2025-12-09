/**
 * Utilitários para gerenciamento de cupons
 */

import { Coupon } from '@/types/coupons'
import { loadData, saveData, isPreviewMode, markAsDirty } from './adminData'
import { isAdmin } from './admin'

const COUPONS_BASE_KEY = 'COUPONS'

/**
 * Carrega cupons baseado no contexto (published para users, draft para admin)
 */
export function loadCoupons(): Coupon[] {
  const isAdminMode = isAdmin()
  const isPreview = isPreviewMode()
  return loadData<Coupon[]>(COUPONS_BASE_KEY, [], isAdminMode)
}

/**
 * Salva cupons (sempre em draft se for admin)
 */
export function saveCoupons(coupons: Coupon[]): void {
  const isAdminMode = isAdmin()
  saveData(COUPONS_BASE_KEY, coupons, isAdminMode)
}

/**
 * Adiciona um cupom
 */
export function addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt'>): Coupon {
  const coupons = loadCoupons()
  const newCoupon: Coupon = {
    ...coupon,
    id: `COUPON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  coupons.push(newCoupon)
  saveCoupons(coupons)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return newCoupon
}

/**
 * Atualiza um cupom
 */
export function updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
  const coupons = loadCoupons()
  const index = coupons.findIndex((c) => c.id === id)
  
  if (index === -1) return null
  
  coupons[index] = { ...coupons[index], ...updates }
  saveCoupons(coupons)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return coupons[index]
}

/**
 * Remove um cupom
 */
export function deleteCoupon(id: string): boolean {
  const coupons = loadCoupons()
  const filtered = coupons.filter((c) => c.id !== id)
  
  if (filtered.length === coupons.length) return false
  
  saveCoupons(filtered)
  // Marca como dirty se for admin
  if (isAdmin()) {
    markAsDirty()
  }
  return true
}

/**
 * Verifica se um cupom é válido para um usuário específico
 */
export function isCouponValidForUser(
  coupon: Coupon,
  userEmail: string,
  userTags: string[] = []
): boolean {
  if (!coupon.active) return false
  
  // Verifica validade de datas
  const now = new Date()
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return false
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return false
  
  // Verifica escopo
  if (coupon.scope === 'todos') return true
  
  if (coupon.scope === 'usuarios') {
    return coupon.userIds?.includes(userEmail) || false
  }
  
  if (coupon.scope === 'tags') {
    return coupon.tags?.some((tag) => userTags.includes(tag)) || false
  }
  
  return false
}

