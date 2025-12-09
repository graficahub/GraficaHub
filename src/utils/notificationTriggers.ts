/**
 * Gatilhos automáticos de notificações
 * Integra com o sistema de pedidos para criar notificações automaticamente
 */

import { createNotification } from '@/types/notifications'
import { OrderMVP } from './ordersMVP'

/**
 * Cria notificação quando pedido é criado
 */
export function notifyOrderCreated(order: OrderMVP, compradorEmail: string): void {
  createNotification({
    userId: compradorEmail,
    title: 'Pedido criado com sucesso',
    message: `Seu pedido #${order.id} foi criado e está aguardando propostas.`,
    type: 'pedido',
    relatedOrderId: order.id,
  })
}

/**
 * Cria notificação quando gráfica aceita pedido
 */
export function notifyOrderAccepted(
  order: OrderMVP,
  compradorEmail: string,
  graficaEmail: string,
  graficaName: string
): void {
  // Notificação para o comprador
  createNotification({
    userId: compradorEmail,
    title: 'Nova proposta para seu pedido',
    message: `A gráfica ${graficaName} enviou uma proposta para o pedido #${order.id}.`,
    type: 'pedido',
    relatedOrderId: order.id,
  })
  
  // Notificação de confirmação para a gráfica (opcional)
  createNotification({
    userId: graficaEmail,
    title: 'Proposta enviada',
    message: `Sua proposta para o pedido #${order.id} foi enviada ao comprador.`,
    type: 'pedido',
    relatedOrderId: order.id,
  })
}

/**
 * Cria notificação quando pedido é finalizado (comprador escolhe gráfica)
 */
export function notifyOrderFinalized(
  order: OrderMVP,
  graficaEscolhidaEmail: string,
  outrasGraficas: Array<{ email: string; name: string }>
): void {
  // Notificação para a gráfica escolhida
  createNotification({
    userId: graficaEscolhidaEmail,
    title: 'Pedido fechado com sua gráfica',
    message: `O comprador escolheu a sua proposta para o pedido #${order.id}.`,
    type: 'pedido',
    relatedOrderId: order.id,
  })
  
  // Notificações para gráficas não escolhidas (opcional)
  outrasGraficas.forEach(grafica => {
    createNotification({
      userId: grafica.email,
      title: 'Pedido finalizado',
      message: `O pedido #${order.id} foi finalizado com outra gráfica.`,
      type: 'pedido',
      relatedOrderId: order.id,
    })
  })
}





