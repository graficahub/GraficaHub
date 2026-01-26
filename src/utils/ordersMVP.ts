/**
 * Utilitários para sistema de pedidos MVP
 */

export interface OrderMVP {
  id: string
  userId: string // Email do comprador
  materialId: string
  quantidade: number
  observacoes?: string
  arquivo?: string // URL ou placeholder
  status: 'pendente' | 'aceito' | 'recusado' | 'finalizado'
  createdAt: string
  aceites: OrderAcceptance[]
  graficaEscolhida?: string // ID da gráfica escolhida pelo comprador
}

export interface OrderAcceptance {
  graficaId: string // Email da gráfica
  data: string
  mensagem?: string
}

const STORAGE_ORDERS_KEY = 'GH_ORDERS'
const STORAGE_PENDING_FOR_PRINTERS_KEY = 'GH_PENDING_FOR_PRINTERS'

/**
 * Carrega todos os pedidos
 */
export function loadOrders(): OrderMVP[] {
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
 * Salva pedidos
 */
export function saveOrders(orders: OrderMVP[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders))
  } catch (err) {
    console.error('❌ Erro ao salvar pedidos:', err)
  }
}

/**
 * Cria um novo pedido
 */
export function createOrder(
  userId: string,
  materialId: string,
  quantidade: number,
  observacoes?: string
): OrderMVP {
  const orders = loadOrders()
  
  const newOrder: OrderMVP = {
    id: `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    materialId,
    quantidade,
    observacoes,
    status: 'pendente',
    createdAt: new Date().toISOString(),
    aceites: [],
  }
  
  orders.push(newOrder)
  saveOrders(orders)
  
  // Distribui para gráficas compatíveis
  distributeOrderToPrinters(newOrder)
  
  // Cria notificação para o comprador
  try {
    if (typeof window !== 'undefined') {
      const { notifyOrderCreated } = require('./notificationTriggers')
      notifyOrderCreated(newOrder, userId)
    }
  } catch (err) {
    // Ignora erro se módulo não estiver disponível
  }
  
  return newOrder
}

/**
 * Distribui pedido para gráficas compatíveis
 */
function distributeOrderToPrinters(order: OrderMVP): void {
  if (typeof window === 'undefined') return
  
  try {
    // Carrega material do catálogo
    const materialCatalog = JSON.parse(
      localStorage.getItem('GH_PUBLISHED_MATERIAL_CATALOG') || '[]'
    )
    const material = materialCatalog.find((m: any) => m.id === order.materialId)
    
    if (!material) return
    
    // Carrega todas as gráficas
    const users = JSON.parse(localStorage.getItem('graficaHubUsers') || '[]')
    
    // Filtra gráficas compatíveis
    const compatiblePrinters = users.filter((user: any) => {
      const receiveOrdersEnabled =
        user.receive_orders_enabled ?? user.receiveOrdersEnabled ?? false

      if (!receiveOrdersEnabled) return false
      if (!user.printers || user.printers.length === 0) return false

      try {
        const { loadUserActiveMaterials } = require('./userMaterials')
        const activeMaterials = loadUserActiveMaterials(user.email)
        if (!activeMaterials || activeMaterials.length === 0) return false
      } catch {
        return false
      }
      
      // Verifica se a gráfica tem impressora com tecnologia compatível
      return user.printers.some((printer: any) => {
        return material.tecnologias.includes(printer.inkTechnology)
      })
    })
    
    // Adiciona pedido à lista pendente de cada gráfica compatível
    compatiblePrinters.forEach((user: any) => {
      const pendingKey = `${STORAGE_PENDING_FOR_PRINTERS_KEY}_${user.email}`
      const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')
      
      if (!pending.find((p: string) => p === order.id)) {
        pending.push(order.id)
        localStorage.setItem(pendingKey, JSON.stringify(pending))
      }
    })
  } catch (err) {
    console.error('❌ Erro ao distribuir pedido:', err)
  }
}

/**
 * Carrega pedidos pendentes de uma gráfica
 */
export function loadPendingOrdersForPrinter(printerEmail: string): OrderMVP[] {
  if (typeof window === 'undefined') return []
  
  try {
    const pendingKey = `${STORAGE_PENDING_FOR_PRINTERS_KEY}_${printerEmail}`
    const pendingIds = JSON.parse(localStorage.getItem(pendingKey) || '[]')
    
    const allOrders = loadOrders()
    return allOrders.filter(order => 
      pendingIds.includes(order.id) && 
      order.status === 'pendente' &&
      !order.aceites.find(a => a.graficaId === printerEmail)
    )
  } catch (err) {
    console.error('❌ Erro ao carregar pedidos pendentes:', err)
    return []
  }
}

/**
 * Aceita um pedido
 */
export function acceptOrder(orderId: string, graficaId: string, mensagem?: string): boolean {
  try {
    const orders = loadOrders()
    const order = orders.find(o => o.id === orderId)
    
    if (!order) return false
    
    // Adiciona aceite
    order.aceites.push({
      graficaId,
      data: new Date().toISOString(),
      mensagem,
    })
    
    // Remove da lista pendente da gráfica
    const pendingKey = `${STORAGE_PENDING_FOR_PRINTERS_KEY}_${graficaId}`
    const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')
    const filtered = pending.filter((id: string) => id !== orderId)
    localStorage.setItem(pendingKey, JSON.stringify(filtered))
    
    saveOrders(orders)
    
    // Log de envio de proposta pela gráfica
    if (typeof window !== 'undefined') {
      const { logEvent } = require('./logService')
      logEvent('info', 'Proposta enviada pela gráfica', {
        userId: graficaId,
        context: 'PROPOSTA',
        details: {
          pedidoId: orderId,
          graficaId,
          valorProposto: 0, // Valor seria obtido da proposta real
          mensagem,
        },
      })
    }
    
    // Cria notificações
    try {
      if (typeof window !== 'undefined') {
        const { notifyOrderAccepted } = require('./notificationTriggers')
        const users = JSON.parse(localStorage.getItem('graficaHubUsers') || '[]')
        const grafica = users.find((u: any) => u.email === graficaId)
        const graficaName = grafica?.companyName || graficaId
        
        notifyOrderAccepted(order, order.userId, graficaId, graficaName)
      }
    } catch (err) {
      // Ignora erro se módulo não estiver disponível
    }
    
    return true
  } catch (err) {
    console.error('❌ Erro ao aceitar pedido:', err)
    return false
  }
}

/**
 * Recusa um pedido (remove da lista pendente)
 */
export function rejectOrder(orderId: string, graficaId: string): boolean {
  try {
    // Log de cancelamento de proposta pela gráfica
    if (typeof window !== 'undefined') {
      const { logEvent } = require('./logService')
      logEvent('warn', 'Proposta cancelada pela gráfica', {
        userId: graficaId,
        context: 'PROPOSTA',
        details: {
          pedidoId: orderId,
          graficaId,
          motivo: 'Recusa do pedido',
        },
      })
    }
    const pendingKey = `${STORAGE_PENDING_FOR_PRINTERS_KEY}_${graficaId}`
    const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')
    const filtered = pending.filter((id: string) => id !== orderId)
    localStorage.setItem(pendingKey, JSON.stringify(filtered))
    return true
  } catch (err) {
    console.error('❌ Erro ao recusar pedido:', err)
    return false
  }
}

/**
 * Comprador escolhe uma gráfica
 */
export function choosePrinterForOrder(orderId: string, graficaId: string): boolean {
  try {
    const orders = loadOrders()
    const order = orders.find(o => o.id === orderId)
    
    if (!order) return false
    
    // Verifica se a gráfica aceitou
    if (!order.aceites.find(a => a.graficaId === graficaId)) {
      return false
    }
    
    order.graficaEscolhida = graficaId
    order.status = 'finalizado'
    
    saveOrders(orders)
    
    // Cria notificações
    try {
      if (typeof window !== 'undefined') {
        const { notifyOrderFinalized } = require('./notificationTriggers')
        const users = JSON.parse(localStorage.getItem('graficaHubUsers') || '[]')
        
        // Outras gráficas que deram aceite mas não foram escolhidas
        const outrasGraficas = order.aceites
          .filter(a => a.graficaId !== graficaId)
          .map(a => {
            const user = users.find((u: any) => u.email === a.graficaId)
            return { email: a.graficaId, name: user?.companyName || a.graficaId }
          })
        
        notifyOrderFinalized(order, graficaId, outrasGraficas)
      }
    } catch (err) {
      // Ignora erro se módulo não estiver disponível
    }
    
    return true
  } catch (err) {
    console.error('❌ Erro ao escolher gráfica:', err)
    return false
  }
}

/**
 * Carrega pedidos de um comprador
 */
export function loadOrdersByUser(userId: string): OrderMVP[] {
  const orders = loadOrders()
  return orders.filter(o => o.userId === userId)
}

