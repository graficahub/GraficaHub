/**
 * Sistema de logs interno do GraficaHub
 * Registra eventos importantes para identificação de bugs e acompanhamento do sistema
 */

export type LogLevel = 'info' | 'warn' | 'error'

export interface SystemLog {
  id: string // UUID
  level: LogLevel
  timestamp: string // ISO string
  userId?: string // Email do usuário (opcional)
  context?: string // Ex: 'LOGIN', 'PEDIDO', 'PROPOSTA', 'MATERIAIS', 'ADMIN', 'USUARIO'
  message: string // Descrição do evento
  details?: any // Objeto com dados extras (pedidoId, payload, etc.)
}

const STORAGE_LOGS_KEY = 'GH_SYSTEM_LOGS'
const MAX_LOGS = 500 // Limite máximo de logs armazenados

/**
 * Gera um ID único simples
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Carrega todos os logs do localStorage
 */
function loadLogs(): SystemLog[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_LOGS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar logs:', err)
    return []
  }
}

/**
 * Salva logs no localStorage
 */
function saveLogs(logs: SystemLog[]): void {
  if (typeof window === 'undefined') return

  try {
    // Mantém apenas os logs mais recentes (limite de MAX_LOGS)
    const logsToSave = logs.slice(0, MAX_LOGS)
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logsToSave))
  } catch (err) {
    console.error('❌ Erro ao salvar logs:', err)
  }
}

/**
 * Registra um evento no sistema de logs
 */
export function logEvent(
  level: LogLevel,
  message: string,
  options?: {
    userId?: string
    context?: string
    details?: any
  }
): void {
  if (typeof window === 'undefined') return

  try {
    const log: SystemLog = {
      id: generateId(),
      level,
      timestamp: new Date().toISOString(),
      message,
      userId: options?.userId,
      context: options?.context,
      details: options?.details,
    }

    const logs = loadLogs()
    // Adiciona no início da lista (mais recente primeiro)
    logs.unshift(log)
    saveLogs(logs)
  } catch (err) {
    console.error('❌ Erro ao registrar log:', err)
  }
}

/**
 * Obtém todos os logs
 */
export function getLogs(): SystemLog[] {
  return loadLogs()
}

/**
 * Limpa todos os logs
 */
export function clearLogs(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_LOGS_KEY)
  } catch (err) {
    console.error('❌ Erro ao limpar logs:', err)
  }
}

/**
 * Filtra logs por parâmetros
 */
export function getLogsByFilter(params: {
  level?: LogLevel
  context?: string
  userId?: string
  searchTerm?: string
}): SystemLog[] {
  let logs = loadLogs()

  // Filtra por nível
  if (params.level) {
    logs = logs.filter((log) => log.level === params.level)
  }

  // Filtra por contexto
  if (params.context) {
    logs = logs.filter((log) => log.context === params.context)
  }

  // Filtra por usuário
  if (params.userId) {
    logs = logs.filter((log) => log.userId === params.userId)
  }

  // Busca por termo (procura na mensagem)
  if (params.searchTerm) {
    const term = params.searchTerm.toLowerCase()
    logs = logs.filter((log) => log.message.toLowerCase().includes(term))
  }

  return logs
}


