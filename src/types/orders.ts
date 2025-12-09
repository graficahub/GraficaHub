export type OrderStatus = 'Em aberto' | 'Em produção' | 'Concluído' | 'Cancelado'

// Importa CategoriaBase do arquivo de dados
import { CategoriaBase } from '@/data/categories'

// Tipo unificado para categorias (suporta ambos os formatos para compatibilidade)
export type OrderCategory = CategoriaBase | 'Adesivo' | 'Lona' | 'Banner' | 'Papel fotográfico' | 'Tecido poliéster' | 'Adesivo perfurado' | 'Outro'

/**
 * Converte categoria antiga para nova estrutura (compatibilidade)
 */
export function normalizeCategory(category: OrderCategory): CategoriaBase {
  const mapping: Record<string, CategoriaBase> = {
    'Adesivo': 'ADESIVO',
    'Lona': 'LONA',
    'Banner': 'BANNER',
    'Papel fotográfico': 'PAPEL_FOTOGRAFICO',
    'Tecido poliéster': 'TECIDO_POLIESTER',
    'Adesivo perfurado': 'ADESIVO',
    'Outro': 'OUTRO',
  }
  
  // Se já está no formato novo, retorna como está
  if (['ADESIVO', 'LONA', 'BANNER', 'PAPEL_FOTOGRAFICO', 'TECIDO_POLIESTER', 'RIGIDOS', 'OUTRO'].includes(category)) {
    return category as CategoriaBase
  }
  
  // Converte formato antigo para novo
  return mapping[category] || 'OUTRO'
}

import { Tecnologia } from '@/config/tecnologiasMateriais'

export interface Order {
  id: string
  service: string // Título/nome do serviço
  category: OrderCategory
  tecnologia?: Tecnologia // Tecnologia usada (nova estrutura)
  materialId?: string // ID do material vinculado
  materialName?: string // Nome do material (para exibição)
  caracteristicaId?: string // ID da característica/acabamento (opcional) - antes era subtipoId
  caracteristicaName?: string // Nome da característica (para exibição) - antes era subtipoName
  width?: string // Largura (ex: "3m")
  height?: string // Altura (ex: "2m")
  quantity: number
  deadline: string // Prazo desejado
  description?: string // Descrição opcional
  status: OrderStatus
  createdAt: string // Data de criação (ISO string)
  userId?: string // Email do usuário que criou (usado como ID para simplificar)
  // Proposta aceita pelo comprador
  acceptedProposalId?: string // ID da proposta aceita
  acceptedGraficaId?: string // graficaId da gráfica escolhida
  acceptedAt?: string // Data/hora do aceite
  // Mantém compatibilidade com campos antigos
  subtipoId?: string
  subtipoName?: string
}

export interface NewOrderFormData {
  service: string
  tecnologia: Tecnologia // Primeiro campo - obrigatório
  materialId: string
  caracteristicaId?: string // ID da característica/acabamento (opcional)
  width: string
  height: string
  quantity: number
  deadline: string
  description: string
  // Campos legados para compatibilidade
  category?: OrderCategory
  subtipoId?: string
}

const STORAGE_ORDERS_KEY = 'graficaHubOrders'

/**
 * Carrega todos os pedidos do localStorage
 */
export function loadOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_ORDERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar pedidos:', err)
    return []
  }
}

/**
 * Salva pedidos no localStorage
 */
export function saveOrdersToStorage(orders: Order[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders))
  } catch (err) {
    console.error('❌ Erro ao salvar pedidos:', err)
  }
}

/**
 * Gera um novo ID de pedido
 */
export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `PED-${timestamp.toString().slice(-6)}-${random.toString().padStart(3, '0')}`
}

