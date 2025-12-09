/**
 * Tipos e estruturas para sistema de notificações
 */

export type NotificationType = 'pedido' | 'sistema' | 'admin'

export interface NotificationScope {
  allUsers?: boolean
  premiumOnly?: boolean
  tags?: string[]
  userIds?: string[] // Usuários específicos
}

export interface Notification {
  id: string
  userId: string | null // null = notificação global/segmentada
  title: string
  message: string
  type: NotificationType
  relatedOrderId?: string
  createdAt: string // ISO date
  read: boolean
  scope?: NotificationScope
}

const STORAGE_NOTIFICATIONS_KEY = 'GH_NOTIFICATIONS'

/**
 * Carrega todas as notificações do localStorage
 */
export function loadAllNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar notificações:', err)
    return []
  }
}

/**
 * Salva notificações no localStorage
 */
export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications))
  } catch (err) {
    console.error('❌ Erro ao salvar notificações:', err)
  }
}

/**
 * Cria uma nova notificação
 */
export function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false,
  }
  
  const all = loadAllNotifications()
  all.push(newNotification)
  saveNotifications(all)
  
  return newNotification
}

/**
 * Obtém notificações de um usuário específico
 */
export function getUserNotifications(
  userId: string,
  userTags: string[] = [],
  isPremium: boolean = false
): Notification[] {
  const all = loadAllNotifications()
  
  return all.filter(notif => {
    // Notificação direcionada ao usuário
    if (notif.userId === userId) return true
    
    // Notificação global/segmentada
    if (notif.userId === null && notif.scope) {
      const scope = notif.scope
      
      // Todos os usuários
      if (scope.allUsers) return true
      
      // Apenas premium
      if (scope.premiumOnly && isPremium) return true
      
      // Por tags
      if (scope.tags && scope.tags.length > 0) {
        const hasMatchingTag = scope.tags.some(tag => userTags.includes(tag))
        if (hasMatchingTag) return true
      }
      
      // Usuários específicos
      if (scope.userIds && scope.userIds.includes(userId)) return true
    }
    
    return false
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Marca notificação como lida
 */
export function markNotificationAsRead(notificationId: string): void {
  const all = loadAllNotifications()
  const updated = all.map(notif =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  )
  saveNotifications(updated)
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export function markAllAsRead(userId: string): void {
  const all = loadAllNotifications()
  const updated = all.map(notif =>
    notif.userId === userId && !notif.read ? { ...notif, read: true } : notif
  )
  saveNotifications(updated)
}

/**
 * Conta notificações não lidas do usuário
 */
export function getUnreadCount(
  userId: string,
  userTags: string[] = [],
  isPremium: boolean = false
): number {
  const notifications = getUserNotifications(userId, userTags, isPremium)
  return notifications.filter(n => !n.read).length
}

/**
 * Conta notificações não lidas do tipo pedido
 */
export function getUnreadOrderNotificationsCount(
  userId: string,
  userTags: string[] = [],
  isPremium: boolean = false
): number {
  const notifications = getUserNotifications(userId, userTags, isPremium)
  return notifications.filter(n => !n.read && n.type === 'pedido').length
}

/**
 * Remove notificação (opcional, para limpeza)
 */
export function deleteNotification(notificationId: string): void {
  const all = loadAllNotifications()
  const filtered = all.filter(notif => notif.id !== notificationId)
  saveNotifications(filtered)
}





