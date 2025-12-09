/**
 * Utilitários para gerenciamento de impressoras no localStorage
 */

export interface Printer {
  id: string
  name: string
  technology: 'UV' | 'Solvente/EcoSolvente' | 'Sublimação' | 'DTF Têxtil' | 'DTF-UV'
  width: string
  brand?: string
  model?: string
  averageSpeed?: string
  createdAt: string
}

const STORAGE_PRINTERS_KEY = 'graficaHubPrinters'

export function loadPrintersFromStorage(): Printer[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_PRINTERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar impressoras:', err)
    return []
  }
}

export function savePrintersToStorage(printers: Printer[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_PRINTERS_KEY, JSON.stringify(printers))
  } catch (err) {
    console.error('❌ Erro ao salvar impressoras:', err)
  }
}

export function createPrinter(printerData: Omit<Printer, 'id' | 'createdAt'>): Printer {
  const printers = loadPrintersFromStorage()
  
  const newPrinter: Printer = {
    ...printerData,
    id: `PRINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  
  printers.push(newPrinter)
  savePrintersToStorage(printers)
  
  return newPrinter
}

export function updatePrinter(printerId: string, updates: Partial<Printer>): Printer | null {
  const printers = loadPrintersFromStorage()
  const index = printers.findIndex(p => p.id === printerId)
  
  if (index === -1) return null
  
  printers[index] = { ...printers[index], ...updates }
  savePrintersToStorage(printers)
  
  return printers[index]
}

export function deletePrinter(printerId: string): boolean {
  const printers = loadPrintersFromStorage()
  const filtered = printers.filter(p => p.id !== printerId)
  
  if (filtered.length === printers.length) return false
  
  savePrintersToStorage(filtered)
  return true
}


