/**
 * Gráficas de teste para desenvolvimento
 * Estes dados são usados para popular o sistema durante desenvolvimento
 */

import { Address } from '@/hooks/useAuth'

export interface TestGraphic {
  companyName: string
  email: string
  password: string
  cpfCnpj: string
  displayName: string
  phone: string
  address: Address
  graficaId: string
  printers: Array<{
    id: string
    name: string
    width: string
    inkTechnology: string
  }>
}

/**
 * Lista de gráficas de teste com dados completos
 */
export const testGraphics: TestGraphic[] = [
  {
    graficaId: 'GRA-PRINT-001',
    companyName: 'Gráfica Print Solutions LTDA',
    email: 'contato@printsolutions.com.br',
    password: 'senha123',
    cpfCnpj: '12.345.678/0001-90',
    displayName: 'Print Solutions',
    phone: '(21) 98765-4321',
    address: {
      street: 'Rua Barão de Mesquita',
      number: '123',
      complement: 'Sala 501',
      neighborhood: 'Tijuca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20540-030',
    },
    printers: [
      {
        id: 'printer-1',
        name: 'Epson SureColor SC-P906',
        width: '1.06m',
        inkTechnology: 'ECO_SOLVENTE',
      },
    ],
  },
  {
    graficaId: 'GRA-EXPRESS-002',
    companyName: 'Impressão Express ME',
    email: 'vendas@expressprint.com.br',
    password: 'senha123',
    cpfCnpj: '98.765.432/0001-10',
    displayName: 'Express Print',
    phone: '(21) 98765-1234',
    address: {
      street: 'Avenida Atlântica',
      number: '456',
      complement: '',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22010-000',
    },
    printers: [
      {
        id: 'printer-2',
        name: 'Roland VersaCAMM VS-640i',
        width: '1.60m',
        inkTechnology: 'UV',
      },
    ],
  },
  {
    graficaId: 'GRA-DIGITAL-003',
    companyName: 'Digital Print Center',
    email: 'orcamento@digitalprint.com.br',
    password: 'senha123',
    cpfCnpj: '11.222.333/0001-44',
    displayName: 'Digital Print',
    phone: '(21) 99876-5432',
    address: {
      street: 'Rua Visconde de Pirajá',
      number: '789',
      complement: 'Loja A',
      neighborhood: 'Ipanema',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22410-003',
    },
    printers: [
      {
        id: 'printer-3',
        name: 'Mimaki UJV100-160',
        width: '1.60m',
        inkTechnology: 'DTF_UV',
      },
    ],
  },
  {
    graficaId: 'GRA-RAPIDO-004',
    companyName: 'Rápido Impressos EIRELI',
    email: 'contato@rapidoimpressos.com.br',
    password: 'senha123',
    cpfCnpj: '55.666.777/0001-88',
    displayName: 'Rápido Impressos',
    phone: '(21) 97654-3210',
    address: {
      street: 'Rua do Ouvidor',
      number: '50',
      complement: '',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-030',
    },
    printers: [
      {
        id: 'printer-4',
        name: 'Roland SOLJET PRO4 XF-640',
        width: '1.60m',
        inkTechnology: 'SOLVENTE',
      },
    ],
  },
  {
    graficaId: 'GRA-PREMIUM-005',
    companyName: 'Premium Graphics Studio',
    email: 'vendas@premiumgraphics.com.br',
    password: 'senha123',
    cpfCnpj: '33.444.555/0001-66',
    displayName: 'Premium Graphics',
    phone: '(21) 98765-6789',
    address: {
      street: 'Avenida das Américas',
      number: '12000',
      complement: 'Sala 301',
      neighborhood: 'Barra da Tijuca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22793-081',
    },
    printers: [
      {
        id: 'printer-5',
        name: 'HP Latex 365',
        width: '1.60m',
        inkTechnology: 'UV',
      },
    ],
  },
  {
    graficaId: 'GRA-ECONOMICA-006',
    companyName: 'Econômica Impressões',
    email: 'orcamento@economica.com.br',
    password: 'senha123',
    cpfCnpj: '77.888.999/0001-11',
    displayName: 'Econômica',
    phone: '(21) 95555-4444',
    address: {
      street: 'Estrada da Posse',
      number: '3200',
      complement: '',
      neighborhood: 'Campo Grande',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '23095-510',
    },
    printers: [
      {
        id: 'printer-6',
        name: 'Epson SureColor SC-P706',
        width: '1.06m',
        inkTechnology: 'ECO_SOLVENTE',
      },
    ],
  },
  {
    graficaId: 'GRA-EXPRESSPRINT-007',
    companyName: 'ExpressPrint Digital',
    email: 'contato@expressprint.com.br',
    password: 'senha123',
    cpfCnpj: '22.333.444/0001-55',
    displayName: 'ExpressPrint',
    phone: '(21) 94444-3333',
    address: {
      street: 'Rua Marques de São Vicente',
      number: '225',
      complement: '1º andar',
      neighborhood: 'Gávea',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22451-040',
    },
    printers: [
      {
        id: 'printer-7',
        name: 'Roland VersaSTUDIO BN-20',
        width: '0.50m',
        inkTechnology: 'DTF',
      },
    ],
  },
  {
    graficaId: 'GRA-SUBLIMACAO-008',
    companyName: 'Sublimação Total LTDA',
    email: 'vendas@sublimacao.com.br',
    password: 'senha123',
    cpfCnpj: '99.000.111/0001-22',
    displayName: 'Sublimação Total',
    phone: '(21) 93333-2222',
    address: {
      street: 'Avenida Brasil',
      number: '15000',
      complement: 'Galpão 5',
      neighborhood: 'Guadalupe',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '21670-200',
    },
    printers: [
      {
        id: 'printer-8',
        name: 'Epson SureColor SC-F3070',
        width: '0.90m',
        inkTechnology: 'SUBLIMACAO',
      },
    ],
  },
]

/**
 * Inicializa gráficas de teste no localStorage (apenas se não existirem)
 * Use com cuidado - apenas para desenvolvimento
 */
export function initializeTestGraphics() {
  if (typeof window === 'undefined') return
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return

  try {
    const stored = localStorage.getItem('graficaHubUsers')
    const existingUsers: any[] = stored ? JSON.parse(stored) : []

    // Verifica se já existem gráficas de teste
    const hasTestGraphics = testGraphics.some((tg) =>
      existingUsers.some((u: any) => u.graficaId === tg.graficaId || u.email === tg.email)
    )

    if (hasTestGraphics) {
      console.log('ℹ️ Gráficas de teste já existem no sistema')
      return
    }

    // Adiciona gráficas de teste
    testGraphics.forEach((graphic) => {
      // Verifica se não existe
      const exists = existingUsers.some((u: any) => u.email === graphic.email || u.graficaId === graphic.graficaId)
      if (!exists) {
        existingUsers.push({
          ...graphic,
          createdAt: new Date().toISOString(),
          status: 'ativo',
        })
      }
    })

    localStorage.setItem('graficaHubUsers', JSON.stringify(existingUsers))
    console.log(`✅ ${testGraphics.length} gráficas de teste inicializadas`)
  } catch (err) {
    console.error('❌ Erro ao inicializar gráficas de teste:', err)
  }
}


