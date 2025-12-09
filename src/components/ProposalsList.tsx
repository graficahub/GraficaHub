'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Proposal, ProposalWithScore } from '@/types/proposals'
import {
  rankProposals,
  calculateProposalContext,
  getBadgesForProposal,
  formatTechnology,
  formatDeliveryType,
  formatLevel,
  getLevelColor,
  getPrecoStatusColor,
} from '@/utils/proposals'
import {
  generateAnonymousGraphicsCode,
  formatarLocalizacaoParcial,
  getGraficaData,
} from '@/utils/proposalPrivacy'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface ProposalsListProps {
  proposals: Proposal[]
  onSelectProposal: (proposal: Proposal) => void
}

interface ProposalCardProps {
  proposal: ProposalWithScore
  index: number
  onSelect: () => void
  context: ReturnType<typeof calculateProposalContext>
}

interface ProposalSummaryModalProps {
  proposal: Proposal | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function ProposalCard({ proposal, index, onSelect, context }: ProposalCardProps) {
  const badges = useMemo(() => getBadgesForProposal(proposal, context), [proposal, context])
  
  // Busca dados da gráfica para exibir localização parcial
  const graficaData = useMemo(() => getGraficaData(proposal.graficaId), [proposal.graficaId])
  const localizacaoParcial = useMemo(
    () => formatarLocalizacaoParcial(graficaData?.address || null),
    [graficaData]
  )
  
  // Gera código anônimo para a gráfica
  const anonymousCode = useMemo(() => generateAnonymousGraphicsCode(index), [index])
  
  // Badges de entrega
  const deliveryBadges = useMemo(() => {
    const badges: string[] = []
    if (proposal.deliveryType === 'RETIRADA') {
      badges.push('Retirada no local')
    } else if (proposal.deliveryType === 'ENTREGA_PAGA') {
      badges.push('Entrega disponível')
    } else if (proposal.deliveryType === 'ENTREGA_GRATIS') {
      badges.push('Entrega grátis')
      badges.push('Entrega disponível')
    }
    return badges
  }, [proposal.deliveryType])

  const distanciaAlta = proposal.distanciaKm > 15

  return (
    <Card className="p-6 hover:bg-white/10 transition-colors">
      <div className="space-y-4">
        {/* Header com nome genérico e badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">
                {anonymousCode}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                  proposal.nivel
                )}`}
              >
                {formatLevel(proposal.nivel)}
              </span>
            </div>

            {/* Localização parcial */}
            {localizacaoParcial && (
              <p className="text-sm text-slate-300 mb-2">
                📍 {localizacaoParcial}
              </p>
            )}

            {/* Badges de entrega */}
            {deliveryBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {deliveryBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Badges gerais */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informações principais em grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preço */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Preço</p>
            <p className="text-2xl font-bold text-white">
              R$ {proposal.precoTotal.toFixed(2).replace('.', ',')}
            </p>
            {proposal.precoPorM2 && (
              <p className="text-sm text-slate-400 mt-1">
                ~R$ {proposal.precoPorM2.toFixed(2).replace('.', ',')}/m²
              </p>
            )}
            <p
              className={`text-xs mt-1 font-medium ${getPrecoStatusColor(
                proposal.precoStatus
              )}`}
            >
              {proposal.precoPercentualVsMedia > 0
                ? `${proposal.precoPercentualVsMedia.toFixed(1)}% acima da média`
                : proposal.precoPercentualVsMedia < 0
                ? `${Math.abs(proposal.precoPercentualVsMedia).toFixed(1)}% abaixo da média`
                : 'Dentro da média da região'}
            </p>
          </div>

          {/* Distância */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Distância aproximada</p>
            <p className="text-lg font-semibold text-white">
              {proposal.distanciaKm.toFixed(1).replace('.', ',')} km de você
            </p>
            {distanciaAlta && (
              <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                ⚠ Distância elevada — o frete pode sair mais caro.
              </p>
            )}
          </div>

          {/* Nota */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Nota da gráfica</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">
                {proposal.notaGeral.toFixed(1).replace('.', ',')}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(proposal.notaGeral)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Tipo de entrega */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Prazo estimado</p>
            <p className="text-sm font-medium text-white">
              {proposal.tempoMedioProducaoHoras}h de produção
            </p>
          </div>

          {/* Tecnologia */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Tecnologia</p>
            <p className="text-sm font-medium text-white">
              {formatTechnology(proposal.tecnologia)}
            </p>
          </div>

          {/* Histórico */}
          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">
              {proposal.historicoNaCategoria} pedidos deste tipo concluídos
            </p>
          </div>
        </div>

        {/* Botão de ação */}
        <div className="pt-4 border-t border-white/10">
          <Button variant="primary" fullWidth onClick={onSelect}>
            Escolher essa gráfica
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ComparisonTable({
  proposals,
  isOpen,
  onClose,
}: {
  proposals: ProposalWithScore[]
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Comparar Propostas</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Gráfica</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Preço</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Distância</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Nota</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Nível</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Entrega</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Tempo produção</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Tecnologia</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Cupom</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal, index) => (
                    <tr
                      key={proposal.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        {generateAnonymousGraphicsCode(index)}
                      </td>
                      <td className="py-3 px-4 text-white">
                        R$ {proposal.precoTotal.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {proposal.distanciaKm.toFixed(1).replace('.', ',')} km
                      </td>
                      <td className="py-3 px-4 text-white">
                        {proposal.notaGeral.toFixed(1).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                            proposal.nivel
                          )}`}
                        >
                          {formatLevel(proposal.nivel)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatDeliveryType(proposal.deliveryType)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {proposal.tempoMedioProducaoHoras}h
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatTechnology(proposal.tecnologia)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {proposal.aceitaCupom ? 'Sim' : 'Não'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ProposalSummaryModal({
  proposal,
  isOpen,
  onClose,
  onConfirm,
}: ProposalSummaryModalProps) {
  // Converte Proposal para ProposalWithScore temporariamente para usar as funções
  const proposalWithScore: ProposalWithScore | null = proposal ? {
    ...proposal,
    score: 0,
    badges: [],
    precoStatus: 'NA_MEDIA',
    precoPercentualVsMedia: 0,
  } : null

  const badges = useMemo(() => {
    if (!proposalWithScore) return []
    const context = calculateProposalContext([proposalWithScore])
    return getBadgesForProposal(proposalWithScore, context)
  }, [proposalWithScore])

  // Busca dados da gráfica para exibir localização parcial no modal
  const graficaData = useMemo(() => {
    if (!proposal) return null
    return getGraficaData(proposal.graficaId)
  }, [proposal])
  
  const localizacaoParcial = useMemo(
    () => formatarLocalizacaoParcial(graficaData?.address || null),
    [graficaData]
  )

  if (!proposal || !proposalWithScore) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Confirmar escolha da gráfica
            </h2>

            <div className="space-y-4 mb-6">
              {/* Localização parcial (ainda não mostra nome) */}
              {localizacaoParcial && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Localização</p>
                  <p className="text-sm font-medium text-white">📍 {localizacaoParcial}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    O nome da gráfica será revelado após a confirmação
                  </p>
                </div>
              )}

              {/* Resumo da proposta */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço total:</span>
                  <span className="text-white font-semibold">
                    R$ {proposal.precoTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distância:</span>
                  <span className="text-white">
                    {proposal.distanciaKm.toFixed(1).replace('.', ',')} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avaliação:</span>
                  <span className="text-white">{proposal.notaGeral.toFixed(1).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo de produção:</span>
                  <span className="text-white">{proposal.tempoMedioProducaoHoras}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega:</span>
                  <span className="text-white">{formatDeliveryType(proposal.deliveryType)}</span>
                </div>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {proposal.aceitaCupom && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✓ Esta gráfica aceita cupom de desconto de R$ 50
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" fullWidth onClick={onConfirm}>
                Confirmar escolha
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function ProposalsList({ proposals, onSelectProposal }: ProposalsListProps) {
  const [showComparison, setShowComparison] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Ranqueia as propostas
  const rankedProposals = useMemo(() => rankProposals(proposals), [proposals])

  // Calcula o contexto para badges (precisa de todas as propostas ranqueadas)
  const context = useMemo(
    () => calculateProposalContext(rankedProposals),
    [rankedProposals]
  )

  const handleSelectProposal = (proposal: ProposalWithScore) => {
    setSelectedProposal(proposal)
    setShowSummary(true)
  }

  const handleConfirmSelection = () => {
    if (selectedProposal) {
      onSelectProposal(selectedProposal)
      setShowSummary(false)
      setSelectedProposal(null)
    }
  }

  if (proposals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-400">Nenhuma proposta recebida ainda.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de comparação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Propostas recebidas ({rankedProposals.length})
          </h2>
          <p className="text-slate-400 mt-1">
            As propostas estão ordenadas por relevância. O nome da gráfica será revelado após sua escolha.
          </p>
        </div>
        {rankedProposals.length > 1 && (
          <Button variant="outline" onClick={() => setShowComparison(true)}>
            Comparar propostas
          </Button>
        )}
      </div>

      {/* Lista de propostas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rankedProposals.map((proposal, index) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            index={index}
            onSelect={() => handleSelectProposal(proposal)}
            context={context}
          />
        ))}
      </div>

      {/* Modal de comparação */}
      <ComparisonTable
        proposals={rankedProposals}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

      {/* Modal de confirmação */}
      <ProposalSummaryModal
        proposal={selectedProposal}
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false)
          setSelectedProposal(null)
        }}
        onConfirm={handleConfirmSelection}
      />
    </div>
  )
}

