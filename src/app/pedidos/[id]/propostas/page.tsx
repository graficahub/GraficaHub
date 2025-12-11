'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { mockProposals } from '@/mocks/proposals'
import ProposalsList from '@/components/ProposalsList'
import { Proposal } from '@/types/proposals'
import Button from '@/components/ui/Button'
import { logEvent } from '@/utils/logService'
import { loadOrdersFromStorage, saveOrdersToStorage } from '@/types/orders'

export default function PropostasPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const pedidoId = params.id as string

  // Proteção de rota
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Log de carregamento de propostas (com tratamento de erro)
  useEffect(() => {
    try {
      if (pedidoId) {
        // Simula carregamento - em produção viria de API
        const proposalsForPedido = mockProposals.filter(p => p.pedidoId === pedidoId)
        if (proposalsForPedido.length === 0) {
          logEvent('warn', 'Nenhuma proposta encontrada para o pedido', {
            userId: user?.email,
            context: 'PROPOSTA',
            details: { pedidoId },
          })
        }
      }
    } catch (err) {
      logEvent('error', 'Erro ao carregar propostas', {
        userId: user?.email,
        context: 'PROPOSTA',
        details: {
          pedidoId,
          error: err instanceof Error ? err.message : String(err),
        },
      })
    }
  }, [pedidoId, user])

  const handleSelectProposal = (proposal: Proposal) => {
    if (!user) return

    try {
      // Salva a proposta aceita no pedido
      const orders = loadOrdersFromStorage()
      const orderIndex = orders.findIndex((o) => o.id === pedidoId)
      
      if (orderIndex !== -1) {
        orders[orderIndex] = {
          ...orders[orderIndex],
          acceptedProposalId: proposal.id,
          acceptedGraficaId: proposal.graficaId,
          acceptedAt: new Date().toISOString(),
          status: 'Em produção', // Muda status do pedido
        }
        saveOrdersToStorage(orders)
      }

      // Log de aceite de proposta
      logEvent('info', 'Proposta aceita pelo comprador', {
        userId: user.email,
        context: 'PROPOSTA',
        details: {
          pedidoId,
          propostaId: proposal.id,
          graficaId: proposal.graficaId,
          precoTotal: proposal.precoTotal,
        },
      })

      // Redireciona para a página de detalhes do pedido
      router.push(`/pedidos/${pedidoId}`)
    } catch (err) {
      // Log de erro
      logEvent('error', 'Erro ao processar aceite de proposta', {
        userId: user?.email,
        context: 'PROPOSTA',
        details: {
          pedidoId,
          propostaId: proposal.id,
          error: err instanceof Error ? err.message : String(err),
        },
      })
      alert('Erro ao processar o aceite. Tente novamente.')
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <main className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Filtra propostas para o pedido atual (mock)
  // Em produção, isso viria de uma API baseado no pedidoId
  const proposalsForPedido = mockProposals.filter(p => p.pedidoId === pedidoId)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Efeito vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <main className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Lista de Aceites - Pedido #{pedidoId}
                </h1>
                <p className="text-slate-400 mt-1">
                  Compare as propostas recebidas e escolha a melhor opção para você.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Voltar ao painel
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo principal */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <ProposalsList
            proposals={proposalsForPedido.length > 0 ? proposalsForPedido : mockProposals}
            onSelectProposal={handleSelectProposal}
          />
        </div>
      </main>
    </div>
  )
}


