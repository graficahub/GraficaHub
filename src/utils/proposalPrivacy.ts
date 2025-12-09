/**
 * Utilitários para privacidade/anonimato das propostas
 * Oculta dados sensíveis da gráfica antes do aceite da proposta
 */

import { Address } from '@/hooks/useAuth'

/**
 * Gera um código genérico para identificar a gráfica anonimamente
 * Ex: Gráfica #A12, Gráfica #B07
 */
export function generateAnonymousGraphicsCode(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = letters[index % letters.length]
  const number = String(Math.floor(index / letters.length) + 1).padStart(2, '0')
  return `Gráfica #${letter}${number}`
}

/**
 * Formata localização parcial (rua sem número, bairro, cidade/UF)
 * Ex: "Rua Barão de Mesquita, Tijuca – Rio de Janeiro/RJ"
 */
export function formatarLocalizacaoParcial(address: Address | null | undefined): string {
  if (!address) {
    return 'Localização não informada'
  }

  const parts: string[] = []

  // Rua sem número
  if (address.street) {
    // Remove números da rua se houver
    const streetWithoutNumber = address.street.replace(/\d+/g, '').trim()
    if (streetWithoutNumber) {
      parts.push(streetWithoutNumber)
    }
  }

  // Bairro
  if (address.neighborhood) {
    parts.push(address.neighborhood)
  }

  // Cidade/UF
  if (address.city || address.state) {
    const cityState = [address.city, address.state].filter(Boolean).join('/')
    if (cityState) {
      parts.push(cityState)
    }
  }

  if (parts.length === 0) {
    return 'Localização não informada'
  }

  // Formato: "Rua X, Bairro Y – Cidade/UF"
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[1]} – ${parts[2]}`
  } else if (parts.length === 2) {
    return `${parts[0]} – ${parts[1]}`
  }

  return parts[0]
}

/**
 * Formata endereço completo (usado após aceite da proposta)
 */
export function formatarEnderecoCompleto(address: Address | null | undefined): string {
  if (!address) {
    return 'Endereço não informado'
  }

  const parts: string[] = []

  if (address.street) {
    const streetPart = address.number
      ? `${address.street}, ${address.number}`
      : address.street
    parts.push(streetPart)
  }

  if (address.complement) {
    parts.push(address.complement)
  }

  if (address.neighborhood) {
    parts.push(address.neighborhood)
  }

  if (address.city || address.state) {
    const cityState = [address.city, address.state].filter(Boolean).join('/')
    if (cityState) {
      parts.push(cityState)
    }
  }

  if (address.zipCode) {
    parts.push(`CEP: ${address.zipCode}`)
  }

  return parts.filter(Boolean).join(', ') || 'Endereço não informado'
}

/**
 * Busca dados da gráfica pelo graficaId ou email (fallback)
 * Prioridade: graficaId > email
 */
export function getGraficaData(graficaId: string): {
  companyName: string
  email: string
  phone: string | null
  address: Address | null
  graficaId?: string
  displayName?: string
} | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('graficaHubUsers')
    if (!stored) return null

    const users = JSON.parse(stored)
    // Primeiro tenta buscar por graficaId, depois por email (fallback)
    let grafica = users.find((u: any) => u.graficaId === graficaId)
    if (!grafica) {
      grafica = users.find((u: any) => u.email === graficaId)
    }

    if (!grafica) return null

    return {
      companyName: grafica.companyName || '',
      email: grafica.email || '',
      phone: grafica.phone || null,
      address: grafica.address || null,
      graficaId: grafica.graficaId || grafica.email,
      displayName: grafica.displayName || grafica.companyName,
    }
  } catch (err) {
    console.error('❌ Erro ao buscar dados da gráfica:', err)
    return null
  }
}

/**
 * Gera um graficaId único baseado no timestamp
 */
export function generateGraficaId(): string {
  return `GRA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

