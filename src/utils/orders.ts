import { Order, OrderStatus, NewOrderFormData, loadOrdersFromStorage, saveOrdersToStorage, generateOrderId } from '@/types/orders'
import { logEvent } from '@/utils/logService'

/**
 * Cria um novo pedido e salva no localStorage
 */
export function criarPedido(
  formData: NewOrderFormData, 
  userId?: string, 
  materialName?: string,
  caracteristicaName?: string
): Order {
  const orders = loadOrdersFromStorage()
  
  const newOrder: Order = {
    id: generateOrderId(),
    service: formData.service.trim(),
    category: formData.category || 'OUTRO', // Usa categoria do formData ou OUTRO como fallback
    tecnologia: formData.tecnologia || undefined,
    materialId: formData.materialId || undefined,
    materialName: materialName || undefined,
    caracteristicaId: formData.caracteristicaId || undefined,
    caracteristicaName: caracteristicaName || undefined,
    // Compatibilidade com campos antigos
    subtipoId: formData.caracteristicaId || formData.subtipoId || undefined,
    subtipoName: caracteristicaName || undefined,
    width: formData.width || undefined,
    height: formData.height || undefined,
    quantity: formData.quantity,
    deadline: formData.deadline.trim(),
    description: formData.description?.trim() || undefined,
    status: 'Em aberto',
    createdAt: new Date().toISOString(),
    userId: userId,
  }

  orders.push(newOrder)
  saveOrdersToStorage(orders)
  
  // Log de criação de pedido
  logEvent('info', 'Novo pedido criado', {
    userId,
    context: 'PEDIDO',
    details: {
      pedidoId: newOrder.id,
      service: newOrder.service,
      materialId: newOrder.materialId,
      quantidade: newOrder.quantity,
      categoria: newOrder.category,
    },
  })
  
  console.log('✅ Pedido criado:', newOrder.id)
  return newOrder
}

/**
 * Cancela um pedido (atualiza status para "Cancelado")
 */
export function cancelarPedido(orderId: string, motivo?: string): Order | null {
  const orders = loadOrdersFromStorage()
  const orderIndex = orders.findIndex(o => o.id === orderId)
  
  if (orderIndex === -1) {
    console.error('❌ Pedido não encontrado:', orderId)
    return null
  }

  const order = orders[orderIndex]

  // Log de cancelamento
  logEvent('warn', 'Pedido cancelado pelo comprador', {
    userId: order.userId,
    context: 'PEDIDO',
    details: {
      pedidoId: orderId,
      motivo: motivo || 'Não informado',
      service: order.service,
    },
  })

  const updatedOrder: Order = {
    ...order,
    status: 'Cancelado',
  }

  orders[orderIndex] = updatedOrder
  saveOrdersToStorage(orders)
  
  console.log('✅ Pedido cancelado:', orderId)
  return updatedOrder
}

/**
 * Busca um pedido por ID
 */
export function getOrderById(orderId: string): Order | null {
  const orders = loadOrdersFromStorage()
  return orders.find(o => o.id === orderId) || null
}

/**
 * Busca todos os pedidos de um usuário
 */
export function getOrdersByUserId(userId?: string): Order[] {
  const orders = loadOrdersFromStorage()
  if (!userId) return orders
  return orders.filter(o => o.userId === userId)
}

/**
 * Formata a data de criação para exibição
 */
export function formatOrderDate(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays <= 7) return `${diffDays} dias atrás`
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

