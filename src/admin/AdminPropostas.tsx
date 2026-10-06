import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { NOME_DA_CASA, moeda } from '../utils/formatos.ts'
import type { PropostaType } from '../utils/types.ts'

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

export default function AdminPropostas() {
  const [propostas, setPropostas] = useState<PropostaType[]>([])
  const [respostas, setRespostas] = useState<Record<number, string>>({})

  function carregar() {
    fetch(`${import.meta.env.VITE_API_URL}/propostas`)
      .then((resposta) => resposta.json())
      .then(setPropostas)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id: number, status: 'ACEITA' | 'RECUSADA') {
    const resposta = respostas[id]?.trim()
    if (!resposta) {
      toast.error('Escreva uma resposta antes de aceitar ou recusar.')
      return
    }

    const r = await fetch(`${import.meta.env.VITE_API_URL}/propostas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta, status, porAdmin: true }),
    })
    if (!r.ok) {
      const erro = await r.json().catch(() => ({}))
      toast.error(erro.erro ?? 'Não foi possível responder a proposta.')
      return
    }
    toast.success(status === 'ACEITA' ? 'Proposta aceita!' : 'Proposta recusada.')
    carregar()
  }

  async function excluir(id: number) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/propostas/${id}`, {
      method: 'DELETE',
    })
    if (!r.ok) {
      toast.error('Não foi possível excluir a proposta.')
      return
    }
    toast.success('Proposta excluída.')
    carregar()
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Controle de Propostas</h1>
      <p className="mb-6 text-sm text-gray-500">
        Nos anúncios de clientes quem responde é o vendedor; aqui você só acompanha. As
        propostas das peças da casa ({NOME_DA_CASA}) são respondidas pelo admin.
      </p>

      <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
        <thead className="bg-gray-800 text-left text-sm text-white">
          <tr>
            <th className="p-3">Peça</th>
            <th className="p-3">Comprador</th>
            <th className="p-3">Vendedor</th>
            <th className="p-3">Proposta</th>
            <th className="p-3">Status</th>
            <th className="p-3">Resposta</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {propostas.map((proposta) => (
            <tr key={proposta.id} className="border-t border-gray-100 align-top">
              <td className="flex items-center gap-2 p-3">
                <img
                  src={proposta.peca.foto}
                  alt={proposta.peca.descricao}
                  className="h-10 w-10 rounded object-cover"
                />
                {proposta.peca.descricao}
              </td>
              <td className="p-3">{proposta.cliente?.nome}</td>
              <td className="p-3">{proposta.peca.vendedor?.nome ?? NOME_DA_CASA}</td>
              <td className="p-3">
                {proposta.valorOferta !== null && (
                  <div className="font-semibold">{moeda(proposta.valorOferta)}</div>
                )}
                {proposta.mensagem}
              </td>
              <td className="p-3">{STATUS_LABEL[proposta.status]}</td>
              <td className="p-3">
                {proposta.status === 'PENDENTE' && !proposta.peca.vendedorId ? (
                  <input
                    type="text"
                    placeholder="Escreva a resposta..."
                    value={respostas[proposta.id] ?? ''}
                    onChange={(e) =>
                      setRespostas((r) => ({ ...r, [proposta.id]: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1"
                  />
                ) : proposta.status === 'PENDENTE' ? (
                  <span className="text-gray-400">Aguardando o vendedor</span>
                ) : (
                  proposta.resposta
                )}
              </td>
              <td className="whitespace-nowrap p-3">
                {proposta.status === 'PENDENTE' && !proposta.peca.vendedorId && (
                  <>
                    <button
                      onClick={() => responder(proposta.id, 'ACEITA')}
                      title="Aceitar"
                      className="mr-1 rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => responder(proposta.id, 'RECUSADA')}
                      title="Recusar"
                      className="mr-1 rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
                    >
                      ✖
                    </button>
                  </>
                )}
                <button
                  onClick={() => excluir(proposta.id)}
                  title="Excluir"
                  className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
