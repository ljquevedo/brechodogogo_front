import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.tsx'
import type { PropostaType } from './utils/types.ts'

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Aguardando resposta',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

const STATUS_COR: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  ACEITA: 'bg-emerald-100 text-emerald-800',
  RECUSADA: 'bg-red-100 text-red-800',
}

export default function MinhasPropostas() {
  const { cliente, carregando } = useAuth()
  const navigate = useNavigate()
  const [propostas, setPropostas] = useState<PropostaType[]>([])

  useEffect(() => {
    if (carregando) return
    if (!cliente) {
      navigate('/login')
      return
    }
    fetch(`${import.meta.env.VITE_API_URL}/propostas/cliente/${cliente.id}`)
      .then((resposta) => resposta.json())
      .then(setPropostas)
  }, [cliente, carregando, navigate])

  if (carregando || !cliente) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Minhas Propostas</h1>

      {propostas.length === 0 ? (
        <p className="text-gray-500">Você ainda não enviou nenhuma proposta.</p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Sua proposta</th>
              <th className="p-3">Resposta</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {propostas.map((proposta) => (
              <tr key={proposta.id} className="border-t border-gray-100">
                <td className="flex items-center gap-2 p-3">
                  <img
                    src={proposta.peca.foto}
                    alt={proposta.peca.descricao}
                    className="h-12 w-12 rounded object-cover"
                  />
                  {proposta.peca.descricao}
                </td>
                <td className="p-3">{proposta.mensagem}</td>
                <td className="p-3">{proposta.resposta ?? '—'}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COR[proposta.status]}`}
                  >
                    {STATUS_LABEL[proposta.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
