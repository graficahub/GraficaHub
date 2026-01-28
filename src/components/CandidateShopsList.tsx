import Card from '@/components/ui/Card'

export type CandidateShop = {
  shop_id?: string | number | null
  grafica_id?: string | number | null
  distance_km?: number | null
  final_score?: number | null
  score?: number | null
}

interface CandidateShopsListProps {
  candidates: CandidateShop[]
  isLoading: boolean
  error?: string
}

export default function CandidateShopsList({
  candidates,
  isLoading,
  error,
}: CandidateShopsListProps) {
  if (isLoading) {
    return (
      <Card className="p-6 mt-6">
        <p className="text-sm text-slate-400">Buscando gráficas candidatas...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 mt-6 border border-yellow-500/30 bg-yellow-500/10">
        <p className="text-sm text-yellow-300">{error}</p>
      </Card>
    )
  }

  if (candidates.length === 0) {
    return (
      <Card className="p-6 mt-6">
        <p className="text-sm text-slate-400">Nenhuma gráfica candidata encontrada.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Gráficas candidatas</h3>
      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <div
            key={`${candidate.shop_id ?? candidate.grafica_id ?? index}`}
            className="p-3 rounded-lg border border-white/10 bg-white/5"
          >
            <p className="text-sm font-medium text-white">
              Gráfica candidata #{index + 1}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              distance_km: {candidate.distance_km ?? 'n/a'} • final_score:{' '}
              {candidate.final_score ?? 'n/a'} • score: {candidate.score ?? 'n/a'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
